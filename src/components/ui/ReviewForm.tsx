import React, { useState } from 'react';
import { Star } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabase';

interface ReviewFormProps {
  onClose: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rating: 0,
    comment: '',
    photos: [] as File[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (formData.name.length > 40) {
      newErrors.name = 'Name must be less than 40 characters';
    }
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    if (!formData.rating || formData.rating < 1) {
      newErrors.rating = 'Please select a rating';
    }
    if (!formData.comment) {
      newErrors.comment = 'Please enter a review';
    }
    if (formData.comment.length > 500) {
      newErrors.comment = 'Review must be less than 500 characters';
    }
    if (formData.photos.length > 5) {
      newErrors.photos = 'Maximum 5 photos allowed';
    }
    formData.photos.forEach((photo, index) => {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (photo.size > maxSize) {
        newErrors[`photo${index}`] = 'Each photo must be less than 2MB';
      }
      if (!['image/jpeg', 'image/png'].includes(photo.type)) {
        newErrors[`photo${index}`] = 'Only JPG and PNG files are allowed';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const photoUrls: string[] = [];

      // Upload photos if provided
      for (const photo of formData.photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('reviews')
          .upload(fileName, photo, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('reviews')
          .getPublicUrl(fileName);

        photoUrls.push(publicUrl);
      }

      // Insert review into database
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            name: formData.name,
            location: formData.location,
            rating: formData.rating,
            comment: formData.comment,
            photo_urls: photoUrls,
            approved: false,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        throw error;
      }

      await Swal.fire({
        icon: 'success',
        title: 'Thank you!',
        text: 'Your review is pending approval.',
        confirmButtonColor: '#00B8B8'
      });

      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again.',
        confirmButtonColor: '#00B8B8'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files].slice(0, 5) // Limit to 5 photos
    }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name*
            </label>
            <input
              type="text"
              id="name"
              className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={40}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location*
            </label>
            <input
              type="text"
              id="location"
              className={`w-full px-4 py-2 border rounded-lg ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., New York, USA"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating*
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="text-2xl focus:outline-none"
                >
                  <Star
                    size={24}
                    className={star <= formData.rating ? 'fill-yellow text-yellow' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
            {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Review* (max 500 characters)
            </label>
            <textarea
              id="comment"
              className={`w-full px-4 py-2 border rounded-lg ${errors.comment ? 'border-red-500' : 'border-gray-300'}`}
              rows={4}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              maxLength={500}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{formData.comment.length}/500</span>
              {errors.comment && <p className="text-red-500">{errors.comment}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-1">
              Photos (optional, max 5)
            </label>
            <input
              type="file"
              id="photos"
              accept="image/jpeg,image/png"
              className="w-full"
              onChange={handlePhotoChange}
              multiple
            />
            {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos}</p>}
            <p className="text-sm text-gray-500 mt-1">Max size: 2MB per photo. JPG or PNG only.</p>

            {/* Preview selected photos */}
            {formData.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Selected photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                    {errors[`photo${index}`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`photo${index}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;