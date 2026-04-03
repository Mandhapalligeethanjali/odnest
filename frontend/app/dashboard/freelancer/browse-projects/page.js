'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import API from '../../../../utils/api';
import toast from 'react-hot-toast';
import { 
  Search, MapPin, Calendar, DollarSign, Clock, 
  Briefcase, Filter, X, Send, Code, Star, 
  LogOut, Settings, Bell, ChevronRight
} from 'lucide-react';

export default function BrowseProjects() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minBudget: '',
    maxBudget: '',
    skills: [],
    location: '',
    isRemote: false
  });
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bidData, setBidData] = useState({
    amount: '',
    proposal: '',
    delivery_days: 7
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) router.push('/login');
    else fetchProjects();
  }, [user, filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.minBudget) params.append('minBudget', filters.minBudget);
      if (filters.maxBudget) params.append('maxBudget', filters.maxBudget);
      if (filters.location) params.append('location', filters.location);
      if (filters.isRemote) params.append('isRemote', true);
      if (filters.skills.length) params.append('skills', filters.skills.join(','));

      const response = await API.get(`/projects?${params.toString()}`);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'freelancer') {
      toast.error('Only freelancers can place bids');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/bids', {
        project_id: selectedProject.id,
        amount: parseFloat(bidData.amount),
        proposal: bidData.proposal,
        delivery_days: parseInt(bidData.delivery_days)
      });
      toast.success('Bid placed successfully!');
      setShowBidModal(false);
      setBidData({ amount: '', proposal: '', delivery_days: 7 });
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  const openBidModal = (project) => {
    setSelectedProject(project);
    setBidData({
      amount: project.budget?.toString() || '',
      proposal: '',
      delivery_days: 7
    });
    setShowBidModal(true);
  };

  const skillOptions = ['React', 'Node.js', 'Python', 'UI/UX', 'Graphic Design', 'Content Writing', 'SEO', 'Mobile Dev'];

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><Briefcase size={18} style={{ color: 'var(--navy)' }} /></div>
          <span className="logo-text">ODnest</span>
        </div>

        <div className="sidebar-user">
          <div className="avatar avatar-green">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--success)' }}>Freelancer</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => router.push('/dashboard/freelancer')} className="sidebar-link">
            <Briefcase size={17} /> My Bids
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/browse-projects')} className="sidebar-link active-green">
            <Search size={17} /> Browse Projects
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/earnings')} className="sidebar-link">
            <DollarSign size={17} /> Earnings
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/reviews')} className="sidebar-link">
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
            <div className="dashboard-subtitle">Find Work</div>
            <h1 className="dashboard-title">Browse Projects</h1>
          </div>
          <button className="btn btn-outline" onClick={() => router.push('/dashboard/freelancer')}>
            Back to Dashboard
          </button>
        </div>

        {/* Search Bar */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="input-group">
            <div className="input-wrap">
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate)' }} />
              <input
                type="text"
                className="input"
                placeholder="Search projects by title, skills, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchProjects()}
                style={{ paddingLeft: 42 }}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Filter size={16} style={{ color: 'var(--gold)' }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Filters</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <input
              type="number"
              className="input"
              placeholder="Min Budget"
              value={filters.minBudget}
              onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
            />
            <input
              type="number"
              className="input"
              placeholder="Max Budget"
              value={filters.maxBudget}
              onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
            />
            <input
              type="text"
              className="input"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={filters.isRemote}
                onChange={(e) => setFilters({ ...filters, isRemote: e.target.checked })}
              />
              <span style={{ fontSize: 13 }}>Remote Only</span>
            </label>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 8, display: 'block' }}>Skills Required</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  onClick={() => {
                    if (filters.skills.includes(skill)) {
                      setFilters({ ...filters, skills: filters.skills.filter(s => s !== skill) });
                    } else {
                      setFilters({ ...filters, skills: [...filters.skills, skill] });
                    }
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    background: filters.skills.includes(skill) ? 'var(--gold)' : 'rgba(201,168,76,0.1)',
                    color: filters.skills.includes(skill) ? 'var(--navy)' : 'var(--slate-light)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    cursor: 'pointer'
                  }}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} className="empty-icon" />
            <h3 className="empty-title">No projects found</h3>
            <p className="empty-desc">Try adjusting your search filters or check back later for new opportunities.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {projects.map((project) => (
              <div key={project.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{project.title}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--slate)' }}>
                        <DollarSign size={14} /> Budget: ₹{project.budget?.toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--slate)' }}>
                        <MapPin size={14} /> {project.is_remote ? 'Remote' : project.location || 'Location TBD'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--slate)' }}>
                        <Calendar size={14} /> Deadline: {new Date(project.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openBidModal(project)}
                    className="btn btn-gold"
                    style={{ padding: '10px 24px' }}
                  >
                    Place Bid
                  </button>
                </div>
                <p style={{ fontSize: 14, color: 'var(--slate-light)', marginBottom: 16, lineHeight: 1.6 }}>
                  {project.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {project.skills_required?.map((skill, idx) => (
                    <span key={idx} className="badge badge-gold" style={{ fontSize: 11 }}>
                      <Code size={10} style={{ marginRight: 4 }} /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bid Modal */}
      {showBidModal && selectedProject && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowBidModal(false)}>
          <div className="card" style={{ maxWidth: 500, width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Place a Bid</h3>
              <button onClick={() => setShowBidModal(false)} style={{ color: 'var(--slate)' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 16 }}>Project: {selectedProject.title}</p>
            <form onSubmit={handleBidSubmit}>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Bid Amount (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={bidData.amount}
                  onChange={(e) => setBidData({ ...bidData, amount: e.target.value })}
                  required
                  min={1}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Delivery Days</label>
                <input
                  type="number"
                  className="input"
                  value={bidData.delivery_days}
                  onChange={(e) => setBidData({ ...bidData, delivery_days: e.target.value })}
                  required
                  min={1}
                  max={90}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 24 }}>
                <label className="input-label">Proposal / Cover Letter</label>
                <textarea
                  className="input"
                  rows={5}
                  value={bidData.proposal}
                  onChange={(e) => setBidData({ ...bidData, proposal: e.target.value })}
                  required
                  placeholder="Why are you the best fit for this project? Describe your approach and relevant experience..."
                />
              </div>
              <button type="submit" className="btn btn-gold btn-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Bid'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}