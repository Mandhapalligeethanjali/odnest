'use client';
import { useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function PaymentModal({ project, freelancer, milestone, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Create order
      const orderResponse = await API.post('/payments/create-order', {
        amount: milestone.amount,
        currency: 'INR',
        receipt: `milestone_${milestone.id}`
      });
      
      const { order_id, amount, currency, key_id } = orderResponse.data;
      
      // Razorpay options
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'ODnest',
        description: `Payment for ${milestone.title}`,
        order_id: order_id,
        handler: async function(response) {
          // Verify payment
          const verifyResponse = await API.post('/payments/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            milestone_id: milestone.id,
            freelancer_id: freelancer.id,
            project_id: project.id,
            amount: amount
          });
          
          if (verifyResponse.data.success) {
            toast.success('Payment successful! Amount held in escrow.');
            onSuccess && onSuccess();
            onClose();
          }
        },
        prefill: {
          name: project.client_name,
          email: project.client_email,
          contact: ''
        },
        theme: {
          color: '#c9a84c'
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal">
      <div className="card" style={{ maxWidth: 400, margin: '0 auto' }}>
        <h3>Confirm Payment</h3>
        <p>Project: {project.title}</p>
        <p>Freelancer: {freelancer.name}</p>
        <p>Milestone: {milestone.title}</p>
        <p>Amount: ₹{milestone.amount.toLocaleString()}</p>
        
        <button 
          onClick={handlePayment} 
          className="btn btn-gold btn-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : `Pay ₹${milestone.amount}`}
        </button>
        <button onClick={onClose} className="btn btn-outline btn-full">
          Cancel
        </button>
      </div>
    </div>
  );
}