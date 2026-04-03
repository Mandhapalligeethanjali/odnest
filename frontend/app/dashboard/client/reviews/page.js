'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import API from '../../../../utils/api';
import toast from 'react-hot-toast';
import {
  Briefcase, Search, DollarSign, Star, StarHalf,
  LogOut, Settings, MessageSquare, Calendar,
  Send, User
} from 'lucide-react';

export default function ClientReviews() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    if (!user) router.push('/login');
    else {
      fetchReviews();
      fetchCompletedProjects();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const response = await API.get('/reviews/client');
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.average_rating || 0);
      setTotalReviews(response.data.total_reviews || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  const fetchCompletedProjects = async () => {
    try {
      const response = await API.get('/projects/completed');
      setCompletedProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching completed projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await API.post('/reviews', {
        project_id: selectedProject.id,
        reviewee_id: selectedProject.freelancer_id,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: '' });
      fetchReviews();
      fetchCompletedProjects();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => interactive && setReviewData({ ...reviewData, rating: i })}
          style={{ background: 'none', border: 'none', cursor: interactive ? 'pointer' : 'default', padding: 0 }}
        >
          {i <= rating ? (
            <Star size={interactive ? 28 : 14} fill="var(--gold)" color="var(--gold)" />
          ) : i - 0.5 <= rating ? (
            <StarHalf size={interactive ? 28 : 14} fill="var(--gold)" color="var(--gold)" />
          ) : (
            <Star size={interactive ? 28 : 14} color="var(--slate)" />
          )}
        </button>
      );
    }
    return stars;
  };

  if (!user) return null;

  if (loading) return (
    <div className="spinner-wrap">
      <div><div className="spinner" /><p className="spinner-text">Loading reviews...</p></div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><Briefcase size={18} style={{ color: 'var(--navy)' }} /></div>
          <span className="logo-text">ODnest</span>
        </div>

        <div className="sidebar-user">
          <div className="avatar avatar-gold">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--gold)' }}>Client</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => router.push('/dashboard/client')} className="sidebar-link">
            <Briefcase size={17} /> My Projects
          </button>
          <button onClick={() => router.push('/dashboard/client/find-talent')} className="sidebar-link">
            <Search size={17} /> Find Talent
          </button>
          <button onClick={() => router.push('/dashboard/client/post-project')} className="sidebar-link">
            <Briefcase size={17} /> Post Project
          </button>
          <button onClick={() => router.push('/dashboard/client/payments')} className="sidebar-link">
            <DollarSign size={17} /> Payments
          </button>
          <button onClick={() => router.push('/dashboard/client/reviews')} className="sidebar-link active-gold">
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
            <div className="dashboard-subtitle">Feedback from Freelancers</div>
            <h1 className="dashboard-title">Reviews & Ratings</h1>
          </div>
        </div>

        {/* Rating Summary */}
        <div className="card" style={{ textAlign: 'center', marginBottom: 32, padding: 40 }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--gold)', marginBottom: 8 }}>
            {averageRating.toFixed(1)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
            {renderStars(averageRating)}
          </div>
          <p style={{ color: 'var(--slate)', fontSize: 13 }}>
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'} from freelancers
          </p>
        </div>

        {/* Pending Reviews Section */}
        {completedProjects.filter(p => !p.reviewed).length > 0 && (
          <div className="table-card" style={{ marginBottom: 32 }}>
            <div className="table-header">
              <h3 className="table-title">Pending Reviews</h3>
              <span className="badge badge-gold">{completedProjects.filter(p => !p.reviewed).length} projects awaiting review</span>
            </div>
            <div style={{ padding: '0 28px' }}>
              {completedProjects.filter(p => !p.reviewed).map((project) => (
                <div key={project.id} style={{ padding: '20px 0', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{project.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--slate)' }}>
                        Freelancer: {project.freelancer_name}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowReviewModal(true);
                      }}
                      className="btn btn-gold"
                    >
                      <Star size={14} /> Write a Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="table-card">
          <div className="table-header">
            <h3 className="table-title">Reviews from Freelancers</h3>
          </div>
          {reviews.length === 0 ? (
            <div className="empty-state" style={{ padding: 60 }}>
              <MessageSquare size={48} className="empty-icon" />
              <h3 className="empty-title">No reviews yet</h3>
              <p className="empty-desc">Complete projects to receive feedback from freelancers</p>
            </div>
          ) : (
            <div style={{ padding: '0 28px' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ padding: '24px 0', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar avatar-gold" style={{ width: 40, height: 40 }}>
                        {review.reviewer_name?.charAt(0) || 'F'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{review.reviewer_name || 'Freelancer'}</div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--slate-light)', lineHeight: 1.6, marginLeft: 52 }}>
                    {review.comment}
                  </p>
                  <div style={{ marginLeft: 52, marginTop: 12 }}>
                    <span className="badge badge-gold" style={{ fontSize: 11 }}>
                      Project: {review.project_title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && selectedProject && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowReviewModal(false)}>
          <div className="card" style={{ maxWidth: 500, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Write a Review</h3>
              <p style={{ fontSize: 14, color: 'var(--slate)' }}>
                Project: {selectedProject.title}
              </p>
              <p style={{ fontSize: 13, color: 'var(--slate-light)' }}>
                Freelancer: {selectedProject.freelancer_name}
              </p>
            </div>
            <form onSubmit={submitReview}>
              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label">Rating</label>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                  {renderStars(reviewData.rating, true)}
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 24 }}>
                <label className="input-label">Your Review</label>
                <textarea
                  className="input"
                  rows={4}
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  required
                  placeholder="Share your experience working with this freelancer..."
                />
              </div>
              <button type="submit" className="btn btn-gold btn-full">
                <Send size={14} /> Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}