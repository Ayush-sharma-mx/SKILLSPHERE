import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CalendarIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

const STATUS_OPTIONS = [
  { id: 'available', label: 'Available ✅', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
  { id: 'busy', label: 'Busy 🟡', color: 'border-amber-500 bg-amber-50 text-amber-800' },
  { id: 'not_available', label: 'Not Available 🔴', color: 'border-red-500 bg-red-50 text-red-800' },
];

const AvailabilityCalendar = () => {
  const [status, setStatus] = useState('available');
  const [availableDates, setAvailableDates] = useState([]);
  const [availableFrom, setAvailableFrom] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const { data } = await api.get('/freelancers/me');
        const profile = data.data;
        if (profile) {
          setStatus(profile.availability || 'available');
          if (profile.availableFrom) {
            setAvailableFrom(new Date(profile.availableFrom).toISOString().split('T')[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load profile availability:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/freelancers/me', {
        availability: status,
        ...(availableFrom ? { availableFrom } : {}),
      });
      toast.success('📅 Availability updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-6 h-6 border-2 border-[#e4e0db] border-t-[#EA6C2A] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#9a9590] mb-3">Current Work Status</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => setStatus(opt.id)}
                className={`p-4 rounded-2xl border-2 text-left font-bold transition-all flex items-center justify-between ${
                  active ? opt.color : 'border-[#e8e4df] bg-white text-[#6b6762] hover:border-[#b5afa9]'
                }`}
              >
                <span>{opt.label}</span>
                {active && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Available From Input */}
      {status !== 'available' && (
        <div className="p-4 rounded-2xl bg-[#f7f4f1] border border-[#e8e4df]">
          <label className="block text-xs font-bold text-[#111110] mb-1.5 flex items-center gap-1.5">
            <ClockIcon className="w-4 h-4 text-[#EA6C2A]" /> Available Again From (Date)
          </label>
          <input
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-[#e4e0db] text-sm font-semibold text-[#111110] focus:outline-none focus:border-[#EA6C2A]"
          />
          <p className="text-xs text-[#9a9590] mt-1">Clients will see when you open up for new projects.</p>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-2 border-t border-[#e8e4df] flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl font-bold text-xs text-white disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #EA6C2A, #c9531a)' }}
        >
          {saving ? 'Saving...' : 'Save Availability Settings'}
        </button>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
