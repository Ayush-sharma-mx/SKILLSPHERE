import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../../features/project/projectSlice';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { CATEGORIES, DURATION_OPTIONS, EXPERIENCE_LEVELS, SKILLS_BY_CATEGORY } from '../../utils/constants';
import { PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';

const STEPS = ['Basic Info', 'Budget & Timeline', 'Skills Required', 'Milestones', 'Review & Post'];

const CreateProject = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((s) => s.project);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    budget: { min: '', max: '', type: 'fixed' },
    duration: '', experienceLevel: 'intermediate',
    requiredSkills: [],
    milestones: [{ title: '', amount: '', dueDate: '', description: '' }],
    isRemote: true,
    location: { city: '', state: '', country: 'India' },
  });
  const [skillInput, setSkillInput] = useState('');

  const setField = (path, value) => {
    setForm(prev => {
      const parts = path.split('.');
      if (parts.length === 1) return { ...prev, [path]: value };
      if (parts.length === 2) return { ...prev, [parts[0]]: { ...prev[parts[0]], [parts[1]]: value } };
      return prev;
    });
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!form.requiredSkills.includes(skillInput.trim())) {
        setForm(f => ({ ...f, requiredSkills: [...f.requiredSkills, skillInput.trim()] }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (i) => setForm(f => ({ ...f, requiredSkills: f.requiredSkills.filter((_, idx) => idx !== i) }));

  const addMilestone = () => setForm(f => ({ ...f, milestones: [...f.milestones, { title: '', amount: '', dueDate: '', description: '' }] }));
  const removeMilestone = (i) => setForm(f => ({ ...f, milestones: f.milestones.filter((_, idx) => idx !== i) }));
  const updateMilestone = (i, field, value) => {
    setForm(f => {
      const m = [...f.milestones];
      m[i] = { ...m[i], [field]: value };
      return { ...f, milestones: m };
    });
  };

  const validateStep = () => {
    if (step === 0 && (!form.title || !form.description || !form.category)) { toast.error('Please fill all required fields'); return false; }
    if (step === 1 && (!form.budget.min || !form.budget.max || !form.duration)) { toast.error('Please fill budget and duration'); return false; }
    if (step === 2 && form.requiredSkills.length === 0) { toast.error('Add at least one required skill'); return false; }
    if (step === 3 && form.milestones.some(m => !m.title || !m.amount)) { toast.error('Fill title and amount for all milestones'); return false; }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    try {
      const cleanMilestones = form.milestones.map(m => {
        const cleaned = { title: m.title, amount: Number(m.amount) };
        if (m.description && m.description.trim()) cleaned.description = m.description.trim();
        if (m.dueDate && m.dueDate.trim()) cleaned.dueDate = m.dueDate;
        return cleaned;
      });
      const payload = {
        ...form,
        budget: { min: Number(form.budget.min), max: Number(form.budget.max), type: form.budget.type },
        milestones: cleanMilestones,
      };
      if (!payload.location?.city && !payload.location?.state) {
        delete payload.location;
      }
      const result = await dispatch(createProject(payload)).unwrap();
      toast.success('Project posted successfully!');
      navigate(`/projects/${result.data._id}`);
    } catch (err) {
      const msg = typeof err === 'string' ? err : (err?.message || JSON.stringify(err) || 'Failed to create project');
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#111110' }}>Post a Project</h1>
        <p className="mb-8" style={{ color: '#9a9590' }}>Find the perfect freelancer with AI-powered matching</p>

        {/* Step Indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    backgroundColor: i < step ? '#16a34a' : i === step ? '#EA6C2A' : '#f0ede9',
                    color: i < step || i === step ? 'white' : '#9a9590',
                    border: i === step ? '3px solid rgba(234,108,42,0.3)' : 'none',
                  }}
                >
                  {i < step ? <CheckIcon className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block font-medium" style={{ color: i === step ? '#EA6C2A' : '#d0cbc5' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 transition-all" style={{ backgroundColor: i < step ? '#16a34a' : '#e8e4df' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="card animate-fade-in">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold" style={{ color: '#111110' }}>Basic Information</h2>
              <Input label="Project Title" required placeholder="e.g., Build a React E-commerce Website" value={form.title} onChange={(e) => setField('title', e.target.value)} />
              <Textarea label="Project Description" required placeholder="Describe the project in detail..." value={form.description} onChange={(e) => setField('description', e.target.value)} rows={5} />
              <Select label="Category" required value={form.category} onChange={(e) => setField('category', e.target.value)}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isRemote" checked={form.isRemote} onChange={(e) => setField('isRemote', e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#EA6C2A' }} />
                <label htmlFor="isRemote" className="text-sm" style={{ color: '#6b6762' }}>This is a remote project</label>
              </div>
              {!form.isRemote && (
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" value={form.location.city} onChange={(e) => setField('location.city', e.target.value)} placeholder="Mumbai" />
                  <Input label="State" value={form.location.state} onChange={(e) => setField('location.state', e.target.value)} placeholder="Maharashtra" />
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold" style={{ color: '#111110' }}>Budget & Timeline</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Minimum Budget (₹)" type="number" required placeholder="10000" value={form.budget.min} onChange={(e) => setField('budget.min', e.target.value)} />
                <Input label="Maximum Budget (₹)" type="number" required placeholder="50000" value={form.budget.max} onChange={(e) => setField('budget.max', e.target.value)} />
              </div>
              <Select label="Project Type" value={form.budget.type} onChange={(e) => setField('budget.type', e.target.value)}>
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </Select>
              <Select label="Project Duration" required value={form.duration} onChange={(e) => setField('duration', e.target.value)}>
                <option value="">Select duration</option>
                {DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </Select>
              <Select label="Experience Level Required" value={form.experienceLevel} onChange={(e) => setField('experienceLevel', e.target.value)}>
                {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label} — {l.desc}</option>)}
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold" style={{ color: '#111110' }}>Required Skills</h2>
              <p className="text-sm" style={{ color: '#9a9590' }}>
                {form.category
                  ? <>Showing skills for <strong style={{ color: '#EA6C2A' }}>{form.category}</strong>. Click to add, or type your own below.</>
                  : 'Select a category in Step 1 to see suggested skills, or type your own below.'}
              </p>

              {/* Suggested Skills Grid */}
              {form.category && ((() => {
                const suggestions = (SKILLS_BY_CATEGORY[form.category] || []);
                const filtered = skillInput.trim()
                  ? suggestions.filter(s => s.toLowerCase().includes(skillInput.trim().toLowerCase()))
                  : suggestions;
                return filtered.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-4 rounded-xl" style={{ backgroundColor: '#f7f4f1', border: '1px solid #e8e4df' }}>
                    {filtered.map(skill => {
                      const isAdded = form.requiredSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            if (isAdded) {
                              setForm(f => ({ ...f, requiredSkills: f.requiredSkills.filter(s => s !== skill) }));
                            } else {
                              setForm(f => ({ ...f, requiredSkills: [...f.requiredSkills, skill] }));
                            }
                          }}
                          className="px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5"
                          style={{
                            backgroundColor: isAdded ? '#EA6C2A' : 'white',
                            color: isAdded ? 'white' : '#6b6762',
                            border: isAdded ? '1px solid #EA6C2A' : '1px solid #e8e4df',
                            transform: isAdded ? 'scale(0.97)' : 'scale(1)',
                            boxShadow: isAdded ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
                          }}
                          onMouseEnter={e => {
                            if (!isAdded) {
                              e.currentTarget.style.borderColor = '#EA6C2A';
                              e.currentTarget.style.color = '#EA6C2A';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(234,108,42,0.15)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isAdded) {
                              e.currentTarget.style.borderColor = '#e8e4df';
                              e.currentTarget.style.color = '#6b6762';
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                            }
                          }}
                        >
                          {isAdded && <CheckIcon className="w-3.5 h-3.5" />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                ) : null;
              })())}

              {/* Custom Skill Input */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#6b6762' }}>
                  {form.category ? 'Search or add custom skill' : 'Add Skills'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = skillInput.trim();
                      if (val && !form.requiredSkills.includes(val)) {
                        setForm(f => ({ ...f, requiredSkills: [...f.requiredSkills, val] }));
                      }
                      setSkillInput('');
                    }
                  }}
                  placeholder={form.category ? `Search ${form.category} skills or type custom...` : 'Type a skill and press Enter'}
                  className="input-field w-full"
                />
                <p className="text-xs mt-1" style={{ color: '#9a9590' }}>Press Enter to add a custom skill not in the list</p>
              </div>

              {/* Selected Skills */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#6b6762' }}>
                  Selected Skills ({form.requiredSkills.length})
                </label>
                <div className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-xl" style={{ backgroundColor: '#f7f4f1', border: '1px solid #e8e4df' }}>
                  {form.requiredSkills.length === 0 ? (
                    <p className="text-sm" style={{ color: '#d0cbc5' }}>No skills added yet — click suggestions above or type your own</p>
                  ) : (
                    form.requiredSkills.map((skill, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium animate-fade-in" style={{ backgroundColor: '#fff3ec', border: '1px solid rgba(234,108,42,0.2)', color: '#EA6C2A' }}>
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(i)}
                          className="ml-0.5 transition-colors font-bold"
                          style={{ color: '#EA6C2A' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = '#EA6C2A'}
                        >×</button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: '#111110' }}>Project Milestones</h2>
                <Button size="sm" variant="secondary" onClick={addMilestone} icon={<PlusIcon className="w-4 h-4" />}>
                  Add Milestone
                </Button>
              </div>
              <div className="space-y-4">
                {form.milestones.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl space-y-3 relative" style={{ border: '1px solid #e8e4df' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: '#EA6C2A' }}>Milestone {i + 1}</span>
                      {form.milestones.length > 1 && (
                        <button onClick={() => removeMilestone(i)} className="p-1 transition-colors" style={{ color: '#ef4444' }}>
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <Input placeholder="Milestone title" value={m.title} onChange={(e) => updateMilestone(i, 'title', e.target.value)} required />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Amount ₹" type="number" value={m.amount} onChange={(e) => updateMilestone(i, 'amount', e.target.value)} required />
                      <Input type="date" value={m.dueDate} onChange={(e) => updateMilestone(i, 'dueDate', e.target.value)} />
                    </div>
                    <Input placeholder="Description (optional)" value={m.description} onChange={(e) => updateMilestone(i, 'description', e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#fff3ec', border: '1px solid rgba(234,108,42,0.2)', color: '#EA6C2A' }}>
                💡 Total budget: {form.milestones.reduce((acc, m) => acc + Number(m.amount || 0), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold" style={{ color: '#111110' }}>Review & Post</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f7f4f1' }}>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#9a9590' }}>Title</p>
                  <p className="font-medium" style={{ color: '#111110' }}>{form.title}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f7f4f1' }}>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#9a9590' }}>Category & Level</p>
                  <p style={{ color: '#111110' }}>{form.category} • {form.experienceLevel}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f7f4f1' }}>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#9a9590' }}>Budget</p>
                  <p style={{ color: '#111110' }}>₹{Number(form.budget.min).toLocaleString()} – ₹{Number(form.budget.max).toLocaleString()} ({form.budget.type})</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f7f4f1' }}>
                  <p className="text-xs uppercase tracking-wide mb-2" style={{ color: '#9a9590' }}>Skills Required</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.requiredSkills.map((s, i) => <span key={i} className="px-2 py-0.5 text-xs rounded-lg" style={{ backgroundColor: '#fff3ec', border: '1px solid rgba(234,108,42,0.2)', color: '#EA6C2A' }}>{s}</span>)}
                  </div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#f7f4f1' }}>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#9a9590' }}>Milestones</p>
                  <p style={{ color: '#111110' }}>{form.milestones.length} milestone(s)</p>
                </div>
                <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#fff3ec', border: '1px solid rgba(234,108,42,0.2)', color: '#EA6C2A' }}>
                  🤖 After posting, our AI will automatically analyze your project and generate semantic embeddings to match you with the best freelancers using Hugging Face.
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-6" style={{ borderTop: '1px solid #e8e4df' }}>
            <Button variant="secondary" onClick={handleBack} disabled={step === 0}>← Back</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={handleNext}>Next →</Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={isLoading}>🚀 Post Project</Button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateProject;
