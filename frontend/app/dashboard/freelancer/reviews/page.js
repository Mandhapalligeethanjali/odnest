'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import API from '../../../../utils/api';
import toast from 'react-hot-toast';
import { 
  Star, StarHalf, User, Calendar, MessageSquare, 
  Briefcase, Search, DollarSign, LogOut, 
  Settings, ArrowLeft 
} from 'lucide-react';

export default function Reviews() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push('/login');
    else fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    try {
      const response = await API.get('/reviews/freelancer');
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.average_rating || 0);
      setTotalReviews(response.data.total_reviews || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load reviews');
      }
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} size={14} fill="var(--gold)" color="var(--gold)" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<StarHalf key={i} size={14} fill="var(--gold)" color="var(--gold)" />);
      } else {
        stars.push(<Star key={i} size={14} color="var(--slate)" />);
      }
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
          <button onClick={() => router.push('/dashboard/freelancer/browse-projects')} className="sidebar-link">
            <Search size={17} /> Browse Projects
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/earnings')} className="sidebar-link">
            <DollarSign size={17} /> Earnings
          </button>
          <button onClick={() => router.push('/dashboard/freelancer/reviews')} className="sidebar-link active-green">
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
            <div className="dashboard-subtitle">Client Feedback</div>
            <h1 className="dashboard-title">Reviews & Ratings</h1>
          </div>
          <button className="btn btn-outline" onClick={() => router.push('/dashboard/freelancer')}>
            Back to Dashboard
          </button>
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
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Reviews List */}
        <div className="table-card">
          <div className="table-header">
            <h3 className="table-title">Client Reviews</h3>
          </div>
          {reviews.length === 0 ? (
            <div className="empty-state" style={{ padding: 60 }}>
              <MessageSquare size={48} className="empty-icon" />
              <h3 className="empty-title">No reviews yet</h3>
              <p className="empty-desc">Complete projects to receive client feedback</p>
            </div>
          ) : (
            <div style={{ padding: '0 28px' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ padding: '24px 0', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar avatar-gold" style={{ width: 40, height: 40 }}>
                        {review.reviewer_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{review.reviewer_name || 'Client'}</div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}