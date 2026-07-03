import React, { useState } from 'react';
import api from '../../services/api';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TAG_OPTIONS = [
  'Professional',
  'On-time',
  'Great quality',
  'Good communicator',
  'Would hire again',
  'Creative',
  'Expert knowledge',
];

const ReviewModal = ({ isOpen, onClose, project, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length < 10) {
      toast.error('Review comment must be at least 10 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const revieweeId = project.hiredFreelancer?._id || project.hiredFreelancer;
      await api.post('/reviews', {
        project: project._id,
        reviewee: revieweeId,
        rating,
        comment,
        tags: selectedTags,
        reviewType: 'client_to_freelancer',
      });
      toast.success('🎉 Review submitted successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#FDFCFB] p-6 shadow-2xl border border-[#e8e4df] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-[#9a9590] hover:text-[#111110] hover:bg-[#f0ede9] transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#EA6C2A]">Project Completed</span>
          <h2 className="text-xl font-black text-[#111110] mt-1">Rate your experience</h2>
          <p className="text-xs text-[#9a9590] mt-0.5">
            Leave feedback for project: <strong className="text-[#6b6762]">{project.title}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Stars */}
          <div className="text-center py-3 bg-[#f7f4f1] rounded-2xl border border-[#e8e4df]">
            <p className="text-xs font-bold text-[#6b6762] mb-2">Overall Rating</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hoverRating || rating);
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    {filled ? (
                      <StarSolid className="w-8 h-8 text-[#EA6C2A]" />
                    ) : (
                      <StarOutline className="w-8 h-8 text-[#c5c0ba]" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-black text-[#111110] mt-1">
              {rating === 5 ? 'Excellent ⭐⭐⭐⭐⭐' : rating === 4 ? 'Good ⭐⭐⭐⭐' : `${rating} Stars`}
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#6b6762] mb-2">Highlights (select tags)</label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-[#EA6C2A] text-white border-[#EA6C2A]'
                        : 'bg-white text-[#6b6762] border-[#e8e4df] hover:border-[#9a9590]'
                    }`}
                  >
                    {active ? '✓ ' : ''}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-[#6b6762] mb-1.5">Detailed Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the quality of work, adherence to schedule, and overall communication..."
              rows={4}
              required
              minLength={10}
              className="w-full rounded-2xl bg-white border border-[#e4e0db] p-3.5 text-sm text-[#111110] focus:border-[#EA6C2A] focus:outline-none transition-colors placeholder:text-[#b5afa9]"
            />
            <p className="text-[10px] text-right text-[#9a9590] mt-1">Min 10 characters</p>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold text-xs text-[#6b6762] bg-[#f0ede9] hover:bg-[#e8e4df] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || comment.length < 10}
              className="flex-1 py-3 rounded-2xl font-bold text-xs text-white disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
