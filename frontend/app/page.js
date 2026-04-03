'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase, Users, Shield, Zap,
  Star, ArrowRight, MapPin, Globe,
  CheckCircle, TrendingUp, Clock, Award
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FreelanceHub</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <button onClick={() => router.push('/projects')} className="hover:text-blue-600 transition">Browse Projects</button>
            <button onClick={() => router.push('/freelancers')} className="hover:text-blue-600 transition">Find Talent</button>
            <button className="hover:text-blue-600 transition">How it Works</button>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => router.push(user.role === 'client' ? '/dashboard/client' : '/dashboard/freelancer')}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                >
                  Log in
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 text-sm text-blue-300 mb-8">
              <MapPin size={14} />
              <span>Hyperlocal + Global Talent Platform for India</span>
            </div>
            <h1 className="text-6xl font-extrabold leading-tight mb-6">
              Hire Top Freelancers.
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Pay Securely.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              AI-powered matching connects you with the right talent — locally or globally.
              Milestone-based escrow keeps your money safe until work is done.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => router.push('/register')}
                className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-500/30"
              >
                Post a Project Free <ArrowRight size={18} />
              </button>
              <button
                onClick={() => router.push('/freelancers')}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold transition"
              >
                Browse Freelancers
              </button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-slate-400">
              <div className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> No commission on first project</div>
              <div className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> Secure escrow payments</div>
              <div className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> Free to sign up</div>
            </div>
          </div>

          {/* Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
            {[
              { label: 'Active Freelancers', value: '12,000+', icon: <Users size={20} className="text-blue-400" /> },
              { label: 'Projects Completed', value: '8,500+', icon: <Briefcase size={20} className="text-cyan-400" /> },
              { label: 'Total Paid Out', value: '₹3.2 Cr+', icon: <TrendingUp size={20} className="text-green-400" /> },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
                <div className="flex justify-center mb-2">{s.icon}</div>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Built specifically for the Indian freelance market with global capabilities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <MapPin size={24} className="text-blue-600" />,
                bg: 'bg-blue-50',
                title: 'Hyperlocal Discovery',
                desc: 'Find freelancers in your city for in-person meetings and faster turnaround'
              },
              {
                icon: <Shield size={24} className="text-green-600" />,
                bg: 'bg-green-50',
                title: 'Escrow Protection',
                desc: 'Funds held securely until you approve each milestone. 100% safe.'
              },
              {
                icon: <Zap size={24} className="text-yellow-600" />,
                bg: 'bg-yellow-50',
                title: 'AI Skill Matching',
                desc: 'Our TF-IDF algorithm finds the perfect talent match for your project'
              },
              {
                icon: <Globe size={24} className="text-purple-600" />,
                bg: 'bg-purple-50',
                title: 'Real-Time Chat',
                desc: 'Built-in messaging and video calls. Collaborate without leaving the platform'
              },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500">Get started in minutes — it's that simple</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Client Flow */}
            <div>
              <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">FOR CLIENTS</div>
              {[
                { num: '1', title: 'Post Your Project', desc: 'Describe your project, set your budget and deadline' },
                { num: '2', title: 'Review Proposals', desc: 'Get bids from verified freelancers and pick the best' },
                { num: '3', title: 'Fund Escrow', desc: 'Securely deposit payment — released only on your approval' },
                { num: '4', title: 'Approve & Done', desc: 'Review deliverables, approve milestones, release payment' },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 mb-6">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {s.num}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{s.title}</h4>
                    <p className="text-gray-500 text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Freelancer Flow */}
            <div>
              <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">FOR FREELANCERS</div>
              {[
                { num: '1', title: 'Create Your Profile', desc: 'Showcase your skills, portfolio and set your rates' },
                { num: '2', title: 'Browse & Bid', desc: 'Find projects that match your skills and submit proposals' },
                { num: '3', title: 'Deliver Work', desc: 'Complete milestones and submit for client review' },
                { num: '4', title: 'Get Paid', desc: 'Receive instant payment once client approves your work' },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 mb-6">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {s.num}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{s.title}</h4>
                    <p className="text-gray-500 text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Thousands</h2>
            <p className="text-gray-500">Real reviews from real users across India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Rahul Sharma',
                role: 'Startup Founder, Hyderabad',
                text: 'Found an amazing full-stack developer within 2 hours. The escrow system gave me complete peace of mind. Will use again!',
                rating: 5,
                avatar: 'RS'
              },
              {
                name: 'Priya Mehta',
                role: 'UI/UX Freelancer, Bangalore',
                text: 'Best platform for Indian freelancers. Payments are instant and projects are high quality. My income doubled in 3 months.',
                rating: 5,
                avatar: 'PM'
              },
              {
                name: 'Arun Kumar',
                role: 'E-commerce Client, Mumbai',
                text: 'The AI matching found the perfect designer for my brand identity project. Saved me hours of searching through profiles.',
                rating: 5,
                avatar: 'AK'
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <Award size={48} className="mx-auto mb-6 text-blue-200" />
          <h2 className="text-4xl font-bold mb-4">Start Your Journey Today</h2>
          <p className="text-blue-100 mb-10 text-lg">Join 12,000+ freelancers and clients already growing with FreelanceHub</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push('/register')}
              className="bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold hover:bg-blue-50 flex items-center gap-2 transition shadow-lg"
            >
              Create Free Account <ArrowRight size={18} />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="border border-white/40 text-white px-10 py-4 rounded-xl font-semibold hover:bg-white/10 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">FreelanceHub</span>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 FreelanceHub. Built for India, loved worldwide.</p>
            <div className="flex gap-6 text-sm">
              <button className="hover:text-white transition">Privacy</button>
              <button className="hover:text-white transition">Terms</button>
              <button className="hover:text-white transition">Support</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}