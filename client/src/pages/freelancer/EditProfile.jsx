import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMyFreelancerProfile as updateFreelancerProfile, fetchMyFreelancerProfile as fetchMyProfile } from '../../features/freelancer/freelancerSlice';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';
import { AVAILABILITY_OPTIONS, SKILL_LEVELS, EXPERIENCE_LEVELS } from '../../utils/constants';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AvailabilityCalendar from '../../components/freelancer/AvailabilityCalendar';

const EditProfile = () => {
  const dispatch = useDispatch();
  const { myProfile, isLoading } = useSelector((s) => s.freelancer);
  const [tab, setTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');

  const [form, setForm] = useState({
    bio: '', title: '', hourlyRate: '', availability: 'available',
    location: { city: '', state: '', country: 'India' },
    skills: [],
    languages: [{ language: '', proficiency: 'conversational' }],
    experience: [],
    education: [],
    certifications: [],
  });

  useEffect(() => {
    dispatch(fetchMyProfile()).then((result) => {
      if (result.payload?.freelancerProfile) {
        const p = result.payload.freelancerProfile;
        setForm(prev => ({
          ...prev,
          bio: p.bio || '',
          title: p.title || '',
          hourlyRate: p.hourlyRate || '',
          availability: p.availability || 'available',
          location: p.location || { city: '', state: '', country: 'India' },
          skills: p.skills || [],
          languages: p.languages?.length > 0 ? p.languages : [{ language: '', proficiency: 'conversational' }],
          experience: p.experience || [],
          education: p.education || [],
          certifications: p.certifications || [],
        }));
      }
    });
  }, []);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setNestedField = (parent, field, value) => setForm(f => ({ ...f, [parent]: { ...f[parent], [field]: value } }));

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const newSkill = { name: skillInput.trim(), level: skillLevel };
    if (!form.skills.find(s => s.name === newSkill.name)) {
      set('skills', [...form.skills, newSkill]);
    }
    setSkillInput('');
  };

  const removeSkill = (i) => set('skills', form.skills.filter((_, idx) => idx !== i));

  const updateArrayField = (field, i, key, value) => {
    const arr = [...form[field]];
    arr[i] = { ...arr[i], [key]: value };
    set(field, arr);
  };

  const addToArray = (field, template) => set(field, [...form[field], template]);
  const removeFromArray = (field, i) => set(field, form[field].filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateFreelancerProfile({ ...form, hourlyRate: Number(form.hourlyRate) })).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) { toast.error(err || 'Failed to update'); }
    finally { setSaving(false); }
  };

  if (isLoading && !myProfile) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}><LoadingSpinner size="lg" /></div>;

  const tabs = ['basic', 'skills', 'availability', 'experience', 'education', 'certifications'];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#111110' }}>Edit Profile</h1>
        <p className="mb-6" style={{ color: '#9a9590' }}>Keep your profile updated to attract better clients</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto" style={{ borderBottom: '1px solid #e8e4df' }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors flex-shrink-0"
              style={{
                borderColor: tab === t ? '#EA6C2A' : 'transparent',
                color: tab === t ? '#EA6C2A' : '#9a9590',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="card animate-fade-in">
          {tab === 'basic' && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg" style={{ color: '#111110' }}>Basic Information</h2>
              <Input label="Professional Title" placeholder="Full Stack Developer" value={form.title} onChange={(e) => set('title', e.target.value)} />
              <Textarea label="Bio / About Me" placeholder="Tell clients about yourself..." value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={5} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Hourly Rate (₹)" type="number" placeholder="2000" value={form.hourlyRate} onChange={(e) => set('hourlyRate', e.target.value)} />
                <Select label="Availability" value={form.availability} onChange={(e) => set('availability', e.target.value)}>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="not_available">Not Available</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" value={form.location.city} onChange={(e) => setNestedField('location', 'city', e.target.value)} placeholder="Mumbai" />
                <Input label="State" value={form.location.state} onChange={(e) => setNestedField('location', 'state', e.target.value)} placeholder="Maharashtra" />
              </div>
              <h3 className="font-semibold mt-4" style={{ color: '#111110' }}>Languages</h3>
              {form.languages.map((lang, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-end">
                  <div className="col-span-2">
                    <Input placeholder="Language (e.g. Hindi)" value={lang.language} onChange={(e) => updateArrayField('languages', i, 'language', e.target.value)} />
                  </div>
                  <Select value={lang.proficiency} onChange={(e) => updateArrayField('languages', i, 'proficiency', e.target.value)}>
                    {['basic', 'conversational', 'fluent', 'native'].map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                  </Select>
                </div>
              ))}
              <Button size="sm" variant="secondary" onClick={() => addToArray('languages', { language: '', proficiency: 'conversational' })}>+ Add Language</Button>
            </div>
          )}

          {tab === 'skills' && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg" style={{ color: '#111110' }}>Skills</h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input placeholder="Add a skill (e.g. React.js)" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
                </div>
                <Select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className="w-36">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </Select>
                <Button onClick={addSkill} icon={<PlusIcon className="w-4 h-4" />}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[60px] p-3 rounded-xl" style={{ backgroundColor: '#f7f4f1', border: '1px solid #e8e4df' }}>
                {form.skills.length === 0 ? (
                  <p className="text-sm" style={{ color: '#d0cbc5' }}>No skills added yet</p>
                ) : (
                  form.skills.map((skill, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm"
                      style={
                        skill.level === 'expert'
                          ? { backgroundColor: '#f0fdf4', borderColor: 'rgba(22,163,74,0.3)', color: '#16a34a' }
                          : skill.level === 'intermediate'
                          ? { backgroundColor: '#fff3ec', borderColor: 'rgba(234,108,42,0.3)', color: '#EA6C2A' }
                          : { backgroundColor: '#f7f4f1', borderColor: '#e8e4df', color: '#6b6762' }
                      }
                    >
                      {skill.name}
                      <span className="text-xs opacity-60 capitalize">• {skill.level}</span>
                      <button onClick={() => removeSkill(i)} className="ml-1 transition-colors"
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'currentColor'}
                      >×</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'availability' && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg" style={{ color: '#111110' }}>Work Availability Settings</h2>
              <p className="text-xs" style={{ color: '#9a9590' }}>Set your current status so clients know if you can take on new projects right now.</p>
              <AvailabilityCalendar />
            </div>
          )}

          {tab === 'experience' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg" style={{ color: '#111110' }}>Work Experience</h2>
                <Button size="sm" variant="secondary" onClick={() => addToArray('experience', { company: '', role: '', from: '', to: '', current: false, description: '' })}>+ Add</Button>
              </div>
              {form.experience.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#9a9590' }}>No experience added yet</p>
              ) : (
                form.experience.map((exp, i) => (
                  <div key={i} className="p-4 rounded-xl space-y-3 relative" style={{ border: '1px solid #e8e4df' }}>
                    <button onClick={() => removeFromArray('experience', i)} className="absolute top-3 right-3 p-1 transition-colors" style={{ color: '#ef4444' }}><TrashIcon className="w-4 h-4" /></button>
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Company" value={exp.company} onChange={(e) => updateArrayField('experience', i, 'company', e.target.value)} />
                      <Input placeholder="Role/Title" value={exp.role} onChange={(e) => updateArrayField('experience', i, 'role', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="date" label="From" value={exp.from ? exp.from.split('T')[0] : ''} onChange={(e) => updateArrayField('experience', i, 'from', e.target.value)} />
                      <Input type="date" label="To" value={exp.to ? exp.to.split('T')[0] : ''} onChange={(e) => updateArrayField('experience', i, 'to', e.target.value)} disabled={exp.current} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateArrayField('experience', i, 'current', e.target.checked)} style={{ accentColor: '#EA6C2A' }} />
                      <label className="text-sm" style={{ color: '#6b6762' }}>Currently working here</label>
                    </div>
                    <Textarea placeholder="Description" value={exp.description} onChange={(e) => updateArrayField('experience', i, 'description', e.target.value)} rows={2} />
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'education' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg" style={{ color: '#111110' }}>Education</h2>
                <Button size="sm" variant="secondary" onClick={() => addToArray('education', { institution: '', degree: '', field: '', from: '', to: '' })}>+ Add</Button>
              </div>
              {form.education.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#9a9590' }}>No education added yet</p>
              ) : (
                form.education.map((edu, i) => (
                  <div key={i} className="p-4 rounded-xl space-y-3 relative" style={{ border: '1px solid #e8e4df' }}>
                    <button onClick={() => removeFromArray('education', i)} className="absolute top-3 right-3 p-1" style={{ color: '#ef4444' }}><TrashIcon className="w-4 h-4" /></button>
                    <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateArrayField('education', i, 'institution', e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Degree (B.Tech, MBA)" value={edu.degree} onChange={(e) => updateArrayField('education', i, 'degree', e.target.value)} />
                      <Input placeholder="Field of Study" value={edu.field} onChange={(e) => updateArrayField('education', i, 'field', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="date" label="From" value={edu.from ? edu.from.split('T')[0] : ''} onChange={(e) => updateArrayField('education', i, 'from', e.target.value)} />
                      <Input type="date" label="To" value={edu.to ? edu.to.split('T')[0] : ''} onChange={(e) => updateArrayField('education', i, 'to', e.target.value)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'certifications' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg" style={{ color: '#111110' }}>Certifications</h2>
                <Button size="sm" variant="secondary" onClick={() => addToArray('certifications', { name: '', issuer: '', year: '', url: '' })}>+ Add</Button>
              </div>
              {form.certifications.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#9a9590' }}>No certifications added</p>
              ) : (
                form.certifications.map((cert, i) => (
                  <div key={i} className="p-4 rounded-xl space-y-3 relative" style={{ border: '1px solid #e8e4df' }}>
                    <button onClick={() => removeFromArray('certifications', i)} className="absolute top-3 right-3 p-1" style={{ color: '#ef4444' }}><TrashIcon className="w-4 h-4" /></button>
                    <Input placeholder="Certification Name" value={cert.name} onChange={(e) => updateArrayField('certifications', i, 'name', e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Issuing Organization" value={cert.issuer} onChange={(e) => updateArrayField('certifications', i, 'issuer', e.target.value)} />
                      <Input type="number" placeholder="Year" value={cert.year} onChange={(e) => updateArrayField('certifications', i, 'year', e.target.value)} />
                    </div>
                    <Input placeholder="Certificate URL (optional)" value={cert.url} onChange={(e) => updateArrayField('certifications', i, 'url', e.target.value)} />
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-6 pt-6 flex justify-end" style={{ borderTop: '1px solid #e8e4df' }}>
            <Button onClick={handleSave} isLoading={saving} size="lg">Save Changes</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditProfile;
