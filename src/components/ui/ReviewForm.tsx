import { X } from 'lucide-react';
import ReviewForm from '../ReviewForm';

interface Props {
  onClose: () => void;
}

export default function ReviewFormModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close review form"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
        <ReviewForm />
      </div>
    </div>
  );
}
