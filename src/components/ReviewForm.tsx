import { useRef, useState } from 'react';
import { Camera, Star, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SERVICE_TYPES = [
  'Airport Transfer',
  'Island Tour',
  'Hotel Transfer',
  'Group Charter',
  'Wedding Transfer',
  'Night Out',
] as const;

type ServiceType = (typeof SERVICE_TYPES)[number];

interface FormState {
  name: string;
  location: string;
  service_type: ServiceType | '';
  rating: number;
  comment: string;
}

interface TouchedState {
  name: boolean;
  location: boolean;
  service_type: boolean;
  rating: boolean;
  comment: boolean;
}

interface PhotoFile {
  file: File;
  preview: string;
}

const MAX_PHOTOS = 3;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

function validate(values: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  if (!values.location.trim()) errors.location = 'Location is required.';
  if (!values.service_type) errors.service_type = 'Please select a service type.';
  if (!values.rating) errors.rating = 'Please select a star rating.';
  if (!values.comment.trim()) {
    errors.comment = 'Comment is required.';
  } else if (values.comment.trim().length < 20) {
    errors.comment = 'Comment must be at least 20 characters.';
  }
  return errors;
}

export default function ReviewForm() {
  const [values, setValues] = useState<FormState>({
    name: '',
    location: '',
    service_type: '',
    rating: 0,
    comment: '',
  });

  const [touched, setTouched] = useState<TouchedState>({
    name: false,
    location: false,
    service_type: false,
    rating: false,
    comment: false,
  });

  const [hoveredStar, setHoveredStar] = useState(0);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const errors = validate(values);

  function touch(field: keyof TouchedState) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    touch(e.target.name as keyof TouchedState);
  }

  function handleStarClick(star: number) {
    setValues((prev) => ({ ...prev, rating: star }));
    touch('rating');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError('');
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const oversized = files.find((f) => f.size > MAX_FILE_BYTES);
    if (oversized) {
      setPhotoError(`"${oversized.name}" exceeds the 15 MB limit.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const combined = [...photos, ...files];
    if (combined.length > MAX_PHOTOS) {
      setPhotoError(`You can upload a maximum of ${MAX_PHOTOS} photos.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const newPhotos: PhotoFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setPhotoError('');
  }

  async function uploadPhotos(): Promise<string[]> {
    const urls: string[] = [];
    for (const { file } of photos) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `reviews/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from('review-images')
        .upload(path, file);
      if (error) throw new Error(`Photo upload failed: ${error.message}`);
      const { data } = supabase.storage.from('review-images').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({
      name: true,
      location: true,
      service_type: true,
      rating: true,
      comment: true,
    });

    if (Object.keys(validate(values)).length > 0) return;

    setLoading(true);
    setSubmitError('');

    try {
      const imageUrls = photos.length > 0 ? await uploadPhotos() : [];

      const { error } = await supabase.from('reviews').insert({
        name: values.name.trim(),
        location: values.location.trim(),
        service_type: values.service_type,
        rating: values.rating,
        comment: values.comment.trim(),
        source: 'website',
        approved: false,
        review_date: new Date().toISOString().split('T')[0],
        image_urls: imageUrls,
      });

      if (error) throw new Error(error.message || 'Something went wrong. Please try again.');

      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="card border border-green-200 bg-green-50 text-center py-10">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mx-auto mb-4">
          <Star className="w-7 h-7 text-green-600 fill-green-600" />
        </div>
        <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Thank you!</h3>
        <p className="text-gray-600">Thanks for your review! It will appear after approval.</p>
      </div>
    );
  }

  const fieldClass = (field: keyof FormState) =>
    `w-full px-4 py-2.5 rounded-lg border text-gray-800 bg-white outline-none transition-colors focus:ring-2 focus:ring-turquoise/40 ${
      touched[field] && errors[field]
        ? 'border-red-400 focus:border-red-400'
        : 'border-gray-300 focus:border-turquoise'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="card w-full max-w-xl mx-auto">
      <h3 className="font-heading text-2xl font-bold text-navy mb-6">Leave a Review</h3>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-turquoise mb-1" htmlFor="name">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. Maria Joseph"
          className={fieldClass('name')}
        />
        {touched.name && errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-turquoise mb-1" htmlFor="location">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={values.location}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. Castries, St. Lucia"
          className={fieldClass('location')}
        />
        {touched.location && errors.location && (
          <p className="mt-1 text-xs text-red-500">{errors.location}</p>
        )}
      </div>

      {/* Service Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-turquoise mb-1" htmlFor="service_type">
          Service Type <span className="text-red-500">*</span>
        </label>
        <select
          id="service_type"
          name="service_type"
          value={values.service_type}
          onChange={handleChange}
          onBlur={handleBlur}
          className={fieldClass('service_type')}
        >
          <option value="">Select a service…</option>
          {SERVICE_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {touched.service_type && errors.service_type && (
          <p className="mt-1 text-xs text-red-500">{errors.service_type}</p>
        )}
      </div>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-turquoise mb-1">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1" onMouseLeave={() => setHoveredStar(0)}>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hoveredStar || values.rating);
            return (
              <button
                key={star}
                type="button"
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                onMouseEnter={() => setHoveredStar(star)}
                onClick={() => handleStarClick(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    filled ? 'text-yellow fill-yellow' : 'text-gray-300 fill-gray-100'
                  }`}
                />
              </button>
            );
          })}
        </div>
        {touched.rating && errors.rating && (
          <p className="mt-1 text-xs text-red-500">{errors.rating}</p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-turquoise mb-1" htmlFor="comment">
          Comment <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          value={values.comment}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Tell us about your experience (minimum 20 characters)…"
          className={`${fieldClass('comment')} resize-none`}
        />
        <div className="flex justify-between items-start mt-1">
          {touched.comment && errors.comment ? (
            <p className="text-xs text-red-500">{errors.comment}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400 ml-auto">
            {values.comment.trim().length}/20 min
          </span>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-turquoise mb-1">
          Photos <span className="text-gray-400 font-normal">(optional)</span>
        </label>

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-turquoise/40 rounded-lg py-6 px-4 flex flex-col items-center gap-2 text-gray-500 hover:border-turquoise hover:bg-turquoise/5 transition-colors"
          >
            <Camera className="w-7 h-7 text-turquoise/60" />
            <span className="text-sm">Add photos (optional, max 3)</span>
            <span className="text-xs text-gray-400">JPG, PNG or WebP · Max 15 MB each</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {photoError && (
          <p className="mt-2 text-xs text-red-500">{photoError}</p>
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={photo.preview}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label="Remove photo"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit error banner */}
      {submitError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {submitError}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-cta w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Submitting…
          </span>
        ) : (
          'Submit Review'
        )}
      </button>
    </form>
  );
}
