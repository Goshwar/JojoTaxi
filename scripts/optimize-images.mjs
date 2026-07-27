/**
 * Responsive image generator.
 *
 * Reads the full-resolution photographs in `image-sources/` and writes every
 * asset the site actually serves into `public/Images/`. Run it with
 * `npm run images` after adding or replacing a photo, then commit the output.
 *
 * Why the sources live outside `public/`: Vite copies `public/` verbatim into
 * `dist/`, so keeping 13 MB of 6787px-wide originals there shipped all of them
 * to visitors — the homepage alone pulled 3.5 MB of images and its LCP element
 * spent ~18 s queued behind them on a throttled mobile connection.
 *
 * `public/Images/` is therefore GENERATED. Do not hand-edit files in it; edit
 * the source in `image-sources/` and re-run this script.
 *
 * Output per source image, one file per ladder width in each of two formats:
 *   public/Images/optimized/<slug>-<width>.avif   primary
 *   public/Images/optimized/<slug>-<width>.<ext>  universal fallback
 * plus the fixed-URL assets in FIXED_OUTPUTS (favicon, social card), and the
 * manifest at src/data/optimizedImages.ts that <ResponsiveImage> reads.
 *
 * Why AVIF and JPEG but no WebP: measured against these actual photographs,
 * WebP was LARGER than mozjpeg on 8 of the 18 sources — by up to 27% on the
 * grainy waterfall and rainforest shots, whose high-frequency noise WebP
 * handles poorly. AVIF beat both on every single source (typically 25-40%
 * under mozjpeg). Since AVIF and WebP now have near-identical browser support
 * (~95%), a WebP tier would only serve the sliver of clients that support WebP
 * but not AVIF, at the cost of another ~90 committed files — and for half the
 * library it would hand them a bigger file than the JPEG fallback. So the
 * fallback tier is a full responsive JPEG ladder rather than a single image:
 * a client without AVIF still gets a correctly-sized picture.
 */
import { mkdir, open as openFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(root, 'image-sources');
const outDir = join(root, 'public', 'Images');
const variantDir = join(outDir, 'optimized');
const manifestPath = join(root, 'src', 'data', 'optimizedImages.ts');

/**
 * Ladder of candidate widths. Each is emitted only when the source is at least
 * that wide, so nothing is ever upscaled. The rungs match the viewport widths
 * that matter on phones and the container widths used on desktop; `sizes` at
 * each call site decides which rung a given device downloads.
 */
const WIDTHS = [320, 480, 768, 1024, 1440, 1920];

/**
 * Widest rung generated for an ordinary image. Nothing on the site renders a
 * non-hero image wider than about 640 CSS px (the half-width columns on
 * /services at the 1280px container), so 1440 already covers a 2x display.
 */
const MAX_WIDTH = 1440;

/**
 * Sources that do render edge-to-edge and therefore earn the 1920 rung: the
 * homepage hero slides and the full-bleed call-to-action bands.
 */
const FULL_BLEED = new Set(['Marigot 1.jpg', 'Pitons 1.jpg', 'Viewpoint 3.jpg', 'Waterfall 1.jpg']);

/**
 * Width used for the `src` attribute — the value a browser falls back to when
 * it ignores `srcset` entirely. Mid-ladder: cheap enough not to hurt, large
 * enough not to look soft.
 */
const FALLBACK_WIDTH = 1024;

// AVIF q50 was chosen from a sweep across this library: visually indistinguishable
// from q58 at normal viewing size while landing 20-25% smaller.
const AVIF = { quality: 50, effort: 4 };
const JPEG = { quality: 76, progressive: true, mozjpeg: true };
const PNG = { compressionLevel: 9, palette: true };

/**
 * Per-source overrides for images whose largest on-screen size is far below the
 * default ladder. The logo renders at 48px tall, so a 1440px variant would only
 * ever waste bytes.
 */
const OVERRIDES = {
  'Logo.png': { widths: [96, 144, 192, 288], fallbackWidth: 192 },
};

/**
 * Assets that must keep a stable, unhashed URL because something outside the
 * React tree points at them: the favicon and apple-touch-icon in index.html,
 * and the Open Graph / Twitter card URL that social platforms have cached.
 */
const FIXED_OUTPUTS = [
  { source: 'Logo.png', out: 'Logo.png', width: 192, height: 192, fit: 'contain' },
  // 1200x630 is the aspect ratio Facebook, LinkedIn, X and iMessage all crop to.
  { source: 'Pitons 1.jpg', out: 'pitons-1.jpg', width: 1200, height: 630, fit: 'cover' },
];

/** "Marigot 1.jpg" -> "marigot-1". Stable, URL-safe, no escaping at call sites. */
const slugify = (name) =>
  basename(name, extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const encode = (pipeline, ext) =>
  ext === '.png' ? pipeline.png(PNG) : pipeline.jpeg(JPEG);

/**
 * `failOn: 'none'` keeps a damaged source from aborting the whole run: libvips
 * emits whatever scanlines it could decode instead of throwing. That matters
 * because the repository already contains two JPEGs truncated mid-upload, and
 * one of them is on the homepage. Truncation is reported by `damaged()` below
 * so it stays visible rather than silently baked into every variant.
 */
const open = (path) => sharp(path, { failOn: 'none' });

/** A JPEG that does not end with the FFD9 end-of-image marker is incomplete. */
const isTruncatedJpeg = async (path) => {
  if (!/\.jpe?g$/i.test(path)) return false;
  const { size } = await stat(path);
  const tail = Buffer.alloc(2);
  const fh = await openFile(path, 'r');
  try {
    await fh.read(tail, 0, 2, size - 2);
  } finally {
    await fh.close();
  }
  return !(tail[0] === 0xff && tail[1] === 0xd9);
};

async function main() {
  const sources = (await readdir(sourceDir))
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort();

  if (sources.length === 0) {
    throw new Error(`No source images found in ${sourceDir}`);
  }

  // Rebuild from scratch so variants of a deleted or renamed source do not
  // linger and keep getting deployed.
  await rm(variantDir, { recursive: true, force: true });
  await mkdir(variantDir, { recursive: true });

  const manifest = {};
  const truncated = [];
  let totalBytes = 0;

  for (const file of sources) {
    const sourcePath = join(sourceDir, file);
    const ext = extname(file).toLowerCase() === '.png' ? '.png' : '.jpg';
    const slug = slugify(file);
    const override = OVERRIDES[file];

    if (await isTruncatedJpeg(sourcePath)) truncated.push(file);

    const { width: srcWidth, height: srcHeight } = await open(sourcePath).metadata();

    const cap = override?.widths ? Infinity : FULL_BLEED.has(file) ? 1920 : MAX_WIDTH;
    const widths = (override?.widths ?? WIDTHS).filter((w) => w <= srcWidth && w <= cap);
    // A source narrower than every rung still needs one variant.
    if (widths.length === 0) widths.push(srcWidth);

    const fallbackWidth =
      [...widths].reverse().find((w) => w <= (override?.fallbackWidth ?? FALLBACK_WIDTH)) ??
      widths[0];

    /**
     * The fallback ladder is deliberately coarser than the AVIF one. It exists
     * for the ~5% of clients without AVIF, so every other rung plus the `src`
     * width gives them correctly-sized images without doubling what the
     * repository has to carry.
     */
    const fallbackWidths = [
      ...new Set([...widths.filter((_, i) => i % 2 === 0), fallbackWidth]),
    ].sort((a, b) => a - b);

    let imageBytes = 0;
    for (const width of widths) {
      const resized = () => open(sourcePath).resize({ width, withoutEnlargement: true });
      const { size } = await resized().avif(AVIF).toFile(join(variantDir, `${slug}-${width}.avif`));
      imageBytes += size;
    }
    for (const width of fallbackWidths) {
      const resized = open(sourcePath).resize({ width, withoutEnlargement: true });
      const { size } = await encode(resized, ext).toFile(
        join(variantDir, `${slug}-${width}${ext}`),
      );
      imageBytes += size;
    }
    totalBytes += imageBytes;

    manifest[`/Images/${file}`] = {
      base: `/Images/optimized/${slug}`,
      widths,
      ext,
      fallbackWidths,
      fallbackWidth,
      width: srcWidth,
      height: srcHeight,
    };

    console.log(
      `  ${file.padEnd(20)} ${String(`${srcWidth}x${srcHeight}`).padEnd(10)} ` +
        `avif[${widths.join(', ')}] ${ext.slice(1)}[${fallbackWidths.join(', ')}] ` +
        `src=${fallbackWidth} — ${(imageBytes / 1024).toFixed(0)} KiB`,
    );
  }

  for (const { source, out, width, height, fit } of FIXED_OUTPUTS) {
    const target = join(outDir, out);
    const ext = extname(out).toLowerCase();
    const { size } = await encode(
      open(join(sourceDir, source)).resize({ width, height, fit }),
      ext === '.png' ? '.png' : '.jpg',
    ).toFile(target);
    totalBytes += size;
    console.log(`  ${source.padEnd(20)} -> Images/${out} (${width}x${height}, ${(size / 1024).toFixed(0)} KiB)`);
  }

  const entries = Object.entries(manifest)
    .map(
      ([src, v]) =>
        `  ${JSON.stringify(src)}: {\n` +
        `    base: ${JSON.stringify(v.base)},\n` +
        `    widths: [${v.widths.join(', ')}],\n` +
        `    ext: ${JSON.stringify(v.ext)},\n` +
        `    fallbackWidths: [${v.fallbackWidths.join(', ')}],\n` +
        `    fallbackWidth: ${v.fallbackWidth},\n` +
        `    width: ${v.width},\n` +
        `    height: ${v.height},\n` +
        `  },`,
    )
    .join('\n');

  await writeFile(
    manifestPath,
    `/**
 * GENERATED by scripts/optimize-images.mjs — do not edit by hand.
 * Run \`npm run images\` after changing anything in image-sources/.
 *
 * Keyed by the original source path so call sites keep referring to
 * "/Images/Marigot 1.jpg" and <ResponsiveImage> resolves the variants.
 */
export interface OptimizedImage {
  /** Path prefix shared by every variant: \`\${base}-\${width}\${format}\`. */
  base: string;
  /** Available AVIF widths, ascending. Never wider than the source. */
  widths: number[];
  /** Extension of the universal fallback ladder — '.jpg' or '.png'. */
  ext: string;
  /** Available fallback widths, ascending. A coarser subset of \`widths\`. */
  fallbackWidths: number[];
  /** Width used for the plain \`src\` attribute. Always in \`fallbackWidths\`. */
  fallbackWidth: number;
  /** Intrinsic source dimensions, used to reserve layout space. */
  width: number;
  height: number;
}

export const OPTIMIZED_IMAGES: Record<string, OptimizedImage> = {
${entries}
};
`,
    'utf8',
  );

  console.log(
    `\n${sources.length} sources -> ${(totalBytes / 1024 / 1024).toFixed(2)} MB of variants ` +
      `in public/Images/. Manifest: ${manifestPath.replace(`${root}/`, '')}`,
  );

  if (truncated.length > 0) {
    console.warn(
      `\nWARNING: ${truncated.length} source image(s) are incomplete — the file ends ` +
        `mid-scan with no JPEG end-of-image marker, so only the top of the picture ` +
        `decodes and the remainder renders as flat grey:\n` +
        truncated.map((f) => `  - image-sources/${f}`).join('\n') +
        `\nVariants were still generated so the build succeeds, but they carry the same ` +
        `damage. Replace these originals with complete files and re-run \`npm run images\`.`,
    );
  }
}

await main();
