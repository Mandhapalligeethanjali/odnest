'use client';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/socketContext';
import API from '../utils/api';
import { Send, User, Paperclip, Smile } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Chat({ projectId, currentUserId, otherUserId, otherUserName, projectTitle }) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load messages
  useEffect(() => {
    fetchMessages();
  }, [projectId]);

  // Join project room
  useEffect(() => {
    if (socket && isConnected && projectId) {
      socket.emit('join_project_room', projectId);
      
      // Listen for new messages
      socket.on('receive_message', (data) => {
        if (data.projectId === projectId) {
          setMessages(prev => [...prev, data]);
        }
      });
      
      // Listen for typing indicator
      socket.on('user_typing', (data) => {
        if (data.userId === otherUserId) {
          setOtherUserTyping(data.isTyping);
        }
      });
      
      // Listen for messages read
      socket.on('messages_read', (data) => {
        if (data.projectId === projectId) {
          setMessages(prev => prev.map(msg => 
            msg.senderId === otherUserId ? { ...msg, is_read: true } : msg
          ));
        }
      });
      
      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('messages_read');
        socket.emit('leave_project_room', projectId);
      };
    }
  }, [socket, isConnected, projectId, otherUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await API.get(`/messages/project/${projectId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!isConnected) {
      toast.error('Not connected to chat server');
      return;
    }
    
    const messageText = newMessage.trim();
    setNewMessage('');
    
    // Emit via socket
    socket.emit('send_message', {
      projectId: projectId,
      receiverId: otherUserId,
      message: messageText,
      senderName: currentUserId === otherUserId ? 'You' : otherUserName
    });
  };

  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      socket.emit('typing', {
        projectId: projectId,
        isTyping: true,
        senderName: 'You'
      });
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit('typing', {
        projectId: projectId,
        isTyping: false,
        senderName: 'You'
      });
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card" style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Chat Header */}
      <div style={{ 
        padding: 16, 
        borderBottom: '1px solid rgba(201,168,76,0.1)',
        background: 'var(--navy-3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="avatar avatar-gold" style={{ width: 40, height: 40 }}>
            {otherUserName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>{otherUserName}</h3>
            <p style={{ fontSize: 12, color: 'var(--slate)' }}>{projectTitle}</p>
          </div>
        </div>
        {!isConnected && (
          <span className="badge badge-red" style={{ marginTop: 8, display: 'inline-block' }}>
            Reconnecting...
          </span>
        )}
      </div>
      
      {/* Messages Area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {messages.map((msg, idx) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id || idx}
              style={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: isOwn ? 'var(--gold)' : 'var(--navy-3)',
                  color: isOwn ? 'var(--navy)' : 'var(--white)'
                }}
              >
                {!isOwn && (
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: 'var(--gold)' }}>
                    {msg.sender_name}
                  </div>
                )}
                <p style={{ fontSize: 13, wordBreak: 'break-word' }}>{msg.message}</p>
                <div style={{ 
                  fontSize: 10, 
                  marginTop: 4,
                  color: isOwn ? 'rgba(10,15,30,0.6)' : 'var(--slate)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 4
                }}>
                  {formatTime(msg.created_at)}
                  {isOwn && msg.is_read && <span>✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        {otherUserTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '8px 14px', borderRadius: 12, background: 'var(--navy-3)' }}>
              <p style={{ fontSize: 12, color: 'var(--slate)' }}>Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form onSubmit={sendMessage} style={{ 
        padding: 16, 
        borderTop: '1px solid rgba(201,168,76,0.1)',
        display: 'flex',
        gap: 12
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyUp={handleTyping}
          placeholder="Type a message..."
          className="input"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-gold" disabled={!isConnected}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}