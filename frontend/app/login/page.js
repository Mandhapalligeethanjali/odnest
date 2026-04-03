'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Briefcase, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success('Welcome back!');
      if (user.role === 'client') router.push('/dashboard/client');
      else if (user.role === 'freelancer') router.push('/dashboard/freelancer');
      else router.push('/dashboard/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Briefcase size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FreelanceHub</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold transition text-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          {/* Test accounts */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Quick Test Login:</p>
            <div className="flex gap-2">
              <button
                onClick={() => setFormData({ email: 'john@example.com', password: '123456' })}
                className="flex-1 text-xs bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                Client Account
              </button>
              <button
                onClick={() => setFormData({ email: 'jane@example.com', password: '123456' })}
                className="flex-1 text-xs bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition font-medium"
              >
                Freelancer Account
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign up free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}