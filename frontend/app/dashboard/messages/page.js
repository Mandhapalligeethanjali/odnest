'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../utils/api';
import Chat from '../../../components/Chat';
import { Briefcase, Search, DollarSign, Star, LogOut, Settings, MessageSquare, ChevronRight } from 'lucide-react';

export default function MessagesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) router.push('/login');
    else fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    try {
      const response = await API.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><Briefcase size={18} style={{ color: 'var(--navy)' }} /></div>
          <span className="logo-text">ODnest</span>
        </div>

        <div className="sidebar-user">
          <div className="avatar avatar-gold">{user?.name?.charAt(0).toUpperCase()}</div>
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
            </>
          ) : (
            <>
              <button onClick={() => router.push('/dashboard/client')} className="sidebar-link">
                <Briefcase size={17} /> My Projects
              </button>
              <button onClick={() => router.push('/dashboard/client/find-talent')} className="sidebar-link">
                <Search size={17} /> Find Talent
              </button>
            </>
          )}
          <button onClick={() => router.push('/dashboard/messages')} className="sidebar-link active-gold">
            <MessageSquare size={17} /> Messages
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

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-subtitle">Communicate</div>
            <h1 className="dashboard-title">Messages</h1>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 24, height: 'calc(100vh - 200px)' }}>
          {/* Conversations List */}
          <div className="card" style={{ overflow: 'auto', padding: 0 }}>
            <div style={{ padding: 16, borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Conversations</h3>
            </div>
            {loading ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <MessageSquare size={40} className="empty-icon" />
                <p className="empty-desc">No messages yet</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.project_id}
                  onClick={() => setSelectedChat(conv)}
                  style={{
                    width: '100%',
                    padding: 16,
                    textAlign: 'left',
                    borderBottom: '1px solid rgba(201,168,76,0.05)',
                    background: selectedChat?.project_id === conv.project_id ? 'rgba(201,168,76,0.05)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar avatar-gold" style={{ width: 40, height: 40 }}>
                        {conv.other_user_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{conv.other_user_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--slate)' }}>{conv.project_title}</div>
                      </div>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="badge badge-gold">{conv.unread_count}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 8 }}>
                    {conv.last_message?.substring(0, 50)}...
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div>
            {selectedChat ? (
              <Chat
                projectId={selectedChat.project_id}
                currentUserId={user.id}
                otherUserId={selectedChat.other_user_id}
                otherUserName={selectedChat.other_user_name}
                projectTitle={selectedChat.project_title}
              />
            ) : (
              <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={48} className="empty-icon" />
                <p className="empty-desc">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}