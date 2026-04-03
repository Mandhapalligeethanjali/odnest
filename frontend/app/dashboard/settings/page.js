'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../utils/api';
import toast from 'react-hot-toast';
import { 
  User, Mail, MapPin, Code, DollarSign, 
  Save, Camera, ArrowLeft, Briefcase, 
  Search, Star, LogOut, Settings as SettingsIcon 
} from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    skills: [],
    hourly_rate: ''
  });
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setFormData({
      name: user.name || '',
      email: user.email || '',
      location: user.location || '',
      bio: user.bio || '',
      skills: user.skills || [],
      hourly_rate: user.hourly_rate || ''
    });
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.put('/users/profile', formData);
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--gold)' }}>{user?.role}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {user?.role === 'freelancer' ? (
            <>
              <button onClick={() => router.push('/dashboard/freelancer')} className="sidebar-link">
                <Briefcase size={17} /> My Bids
              </button>
              <button onClick={() => router.push('/dashboard/freelancer/browse-projects')} className="sidebar-link">
                <Search size={17} /> Browse Projects
              </button>
              <button onClick={() => router.push('/dashboard/freelancer/earnings')} className="sidebar-link">
                <DollarSign size={17} /> Earnings
              </button>
              <button onClick={() => router.push('/dashboard/freelancer/reviews')} className="sidebar-link">
                <Star size={17} /> Reviews
              </button>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/dashboard/client')} className="sidebar-link">
                <Briefcase size={17} /> My Projects
              </button>
            </>
          )}
          <button onClick={() => router.push('/dashboard/settings')} className="sidebar-link active-gold">
            <SettingsIcon size={17} /> Settings
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
            <div className="dashboard-subtitle">Account Preferences</div>
            <h1 className="dashboard-title">Settings</h1>
          </div>
          <button className="btn btn-outline" onClick={() => router.back()}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            {/* Avatar Section */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div className="avatar avatar-gold" style={{ width: 100, height: 100, fontSize: 36, margin: '0 auto 16px' }}>
                {formData.name?.charAt(0) || <User size={40} />}
              </div>
              <button type="button" className="btn btn-outline btn-sm">
                <Camera size={14} /> Change Avatar
              </button>
            </div>

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">
                <User size={12} style={{ display: 'inline', marginRight: 6 }} /> Full Name
              </label>
              <input 
                type="text" 
                name="name" 
                className="input" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">
                <Mail size={12} style={{ display: 'inline', marginRight: 6 }} /> Email Address
              </label>
              <input 
                type="email" 
                className="input" 
                value={formData.email} 
                disabled 
                style={{ opacity: 0.6 }} 
              />
              <p style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4 }}>Email cannot be changed</p>
            </div>

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">
                <MapPin size={12} style={{ display: 'inline', marginRight: 6 }} /> Location
              </label>
              <input 
                type="text" 
                name="location" 
                className="input" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="City, Country" 
              />
            </div>

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">Bio / About Me</label>
              <textarea 
                name="bio" 
                className="input" 
                rows={4} 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Tell clients about your experience and expertise..." 
              />
            </div>

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">
                <Code size={12} style={{ display: 'inline', marginRight: 6 }} /> Skills
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
                <button type="button" onClick={addSkill} className="btn btn-outline">Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {formData.skills.map((skill, idx) => (
                  <span key={idx} className="badge badge-gold" style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)}>
                    {skill} ✕
                  </span>
                ))}
              </div>
            </div>

            {user?.role === 'freelancer' && (
              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label">
                  <DollarSign size={12} style={{ display: 'inline', marginRight: 6 }} /> Hourly Rate (₹)
                </label>
                <input 
                  type="number" 
                  name="hourly_rate" 
                  className="input" 
                  value={formData.hourly_rate} 
                  onChange={handleChange} 
                  placeholder="e.g., 500" 
                />
              </div>
            )}

            <button type="submit" className="btn btn-gold btn-full" disabled={loading} style={{ marginTop: 24 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}