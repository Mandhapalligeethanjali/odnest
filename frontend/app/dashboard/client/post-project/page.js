'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import API from '../../../../utils/api';
import toast from 'react-hot-toast';
import {
  Briefcase, Search, DollarSign, Star,
  LogOut, Settings, PlusCircle, X,
  Calendar, MapPin, Code, FileText,
  AlertCircle, CheckCircle, ArrowLeft
} from 'lucide-react';

export default function PostProjectPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    skills_required: [],
    deadline: '',
    location: '',
    is_remote: true
  });
  const [skillInput, setSkillInput] = useState('');

  // Redirect if not logged in or not client
  if (typeof window !== 'undefined' && (!user || user.role !== 'client')) {
    router.push('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills_required.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills_required: formData.skills_required.filter(s => s !== skill)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a project description');
      return;
    }
    if (!formData.budget || formData.budget <= 0) {
      toast.error('Please enter a valid budget');
      return;
    }
    if (!formData.deadline) {
      toast.error('Please select a deadline');
      return;
    }
    if (formData.skills_required.length === 0) {
      toast.error('Please add at least one required skill');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await API.post('/projects', {
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        skills_required: formData.skills_required,
        deadline: formData.deadline,
        location: formData.location || null,
        is_remote: formData.is_remote
      });
      
      toast.success('Project posted successfully!');
      
      // Redirect to client dashboard
      setTimeout(() => {
        router.push('/dashboard/client');
      }, 1500);
      
    } catch (error) {
      console.error('Error posting project:', error);
      toast.error(error.response?.data?.message || 'Failed to post project');
    } finally {
      setLoading(false);
    }
  };

  const skillSuggestions = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
    'UI/UX Design', 'Graphic Design', 'Content Writing', 'SEO',
    'Mobile Development', 'Flutter', 'React Native', 'AWS',
    'MongoDB', 'PostgreSQL', 'WordPress', 'Shopify'
  ];

  // Don't render if no user
  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Briefcase size={18} style={{ color: 'var(--navy)' }} />
          </div>
          <span className="logo-text">ODnest</span>
        </div>

        <div className="sidebar-user">
          <div className="avatar avatar-gold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gold)' }}>
              Client
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => router.push('/dashboard/client')} className="sidebar-link">
            <Briefcase size={17} /> My Projects
          </button>
          <button onClick={() => router.push('/dashboard/client/find-talent')} className="sidebar-link">
            <Search size={17} /> Find Talent
          </button>
          <button onClick={() => router.push('/dashboard/client/post-project')} className="sidebar-link active-gold">
            <PlusCircle size={17} /> Post Project
          </button>
          <button onClick={() => router.push('/dashboard/client/payments')} className="sidebar-link">
            <DollarSign size={17} /> Payments
          </button>
          <button onClick={() => router.push('/dashboard/client/reviews')} className="sidebar-link">
            <Star size={17} /> Reviews
          </button>
          <button onClick={() => router.push('/dashboard/settings')} className="sidebar-link">
            <Settings size={17} /> Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link danger" onClick={logout}>
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-subtitle">Create New Opportunity</div>
            <h1 className="dashboard-title">Post a Project</h1>
          </div>
          <button className="btn btn-outline" onClick={() => router.back()}>
            <ArrowLeft size={16} /> Cancel
          </button>
        </div>

        <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            {/* Project Title */}
            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="input-label">
                <FileText size={12} style={{ display: 'inline', marginRight: 6 }} />
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                className="input"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., E-commerce Website Development"
              />
              <p style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4 }}>
                Be specific and descriptive about what you need
              </p>
            </div>

            {/* Project Description */}
            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="input-label">
                <FileText size={12} style={{ display: 'inline', marginRight: 6 }} />
                Project Description *
              </label>
              <textarea
                name="description"
                className="input"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe your project in detail. What do you need? What are the requirements? Any specific technologies or approaches?"
              />
            </div>

            {/* Budget */}
            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="input-label">
                <DollarSign size={12} style={{ display: 'inline', marginRight: 6 }} />
                Budget (₹) *
              </label>
              <input
                type="number"
                name="budget"
                className="input"
                value={formData.budget}
                onChange={handleChange}
                required
                min={100}
                step={100}
                placeholder="e.g., 50000"
              />
              <p style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4 }}>
                Set a realistic budget to attract quality freelancers
              </p>
            </div>

            {/* Skills Required */}
            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="input-label">
                <Code size={12} style={{ display: 'inline', marginRight: 6 }} />
                Skills Required *
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="input"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill (e.g., React, Python)"
                />
                <button type="button" onClick={addSkill} className="btn btn-outline">
                  Add
                </button>
              </div>
              
              {/* Skill Suggestions */}
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 8 }}>
                  Suggested skills:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {skillSuggestions.slice(0, 12).map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (!formData.skills_required.includes(skill)) {
                          setFormData({
                            ...formData,
                            skills_required: [...formData.skills_required, skill]
                          });
                        }
                      }}
                      className="badge badge-slate"
                      style={{ cursor: 'pointer' }}
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Added Skills */}
              {formData.skills_required.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {formData.skills_required.map((skill, idx) => (
                    <span key={idx} className="badge badge-gold" style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)}>
                      {skill} ✕
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Deadline */}
            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="input-label">
                <Calendar size={12} style={{ display: 'inline', marginRight: 6 }} />
                Project Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                className="input"
                value={formData.deadline}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Location & Remote Option */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 24 }}>
              <div className="input-group">
                <label className="input-label">
                  <MapPin size={12} style={{ display: 'inline', marginRight: 6 }} />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  className="input"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Hyderabad, India"
                  disabled={formData.is_remote}
                  style={{ opacity: formData.is_remote ? 0.5 : 1 }}
                />
              </div>
              
              <div className="input-group" style={{ justifyContent: 'center' }}>
                <label className="input-label" style={{ textAlign: 'center' }}>
                  Remote Work
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 8 }}>
                  <input
                    type="checkbox"
                    name="is_remote"
                    checked={formData.is_remote}
                    onChange={handleChange}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13 }}>Yes, remote is OK</span>
                </label>
              </div>
            </div>

            {/* Tips Box */}
            <div className="card" style={{ marginBottom: 24, background: 'rgba(201,168,76,0.05)', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertCircle size={18} style={{ color: 'var(--gold)' }} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>Tips for a Great Project Post</span>
              </div>
              <ul style={{ fontSize: 12, color: 'var(--slate-light)', marginLeft: 20, lineHeight: 1.8 }}>
                <li>Be specific about your requirements and deliverables</li>
                <li>Set a realistic budget based on market rates</li>
                <li>Include relevant skills to attract the right talent</li>
                <li>Provide clear milestones if it's a large project</li>
                <li>Share examples or references of what you're looking for</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-gold"
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading ? 'Posting Project...' : 'Post Project'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        {(formData.title || formData.description) && (
          <div className="card" style={{ marginTop: 32, background: 'rgba(16,185,129,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <CheckCircle size={18} style={{ color: 'var(--success)' }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Preview</span>
            </div>
            {formData.title && <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{formData.title}</h3>}
            {formData.description && (
              <p style={{ fontSize: 14, color: 'var(--slate-light)', marginBottom: 16, lineHeight: 1.6 }}>
                {formData.description.length > 200 ? formData.description.substring(0, 200) + '...' : formData.description}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
              {formData.budget && <span className="badge badge-gold">₹{Number(formData.budget).toLocaleString()}</span>}
              <span className="badge badge-blue">
                {formData.is_remote ? 'Remote' : formData.location || 'Location TBD'}
              </span>
              {formData.deadline && (
                <span className="badge badge-slate">
                  Due: {new Date(formData.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
            {formData.skills_required.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {formData.skills_required.map((skill, idx) => (
                  <span key={idx} className="badge badge-gold" style={{ fontSize: 11 }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}