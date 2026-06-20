import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Heart, Users, MessageCircle, ArrowRight, Zap, Shield, Star } from 'lucide-react';

/**
 * Public landing page with hero section, features, and CTA
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">GymBuddy</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-rose-400/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full mb-6 border border-primary-100">
              <Zap className="w-4 h-4" />
              The #1 Gym Partner App
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-tight mb-6"
          >
            Find Your Perfect{' '}
            <span className="text-gradient">Gym Partner</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10"
          >
            Swipe, match, and train together. Connect with fitness enthusiasts
            who share your workout style, gym, and schedule.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              to="/signup"
              className="group px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-600/30 hover:shadow-primary-600/50 transition-all flex items-center gap-2"
            >
              Start Swiping Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
            >
              I Have an Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto">
              Three simple steps to find your ideal workout partner
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Swipe',
                description:
                  'Browse profiles of fitness enthusiasts near you. See their gym, workout type, and schedule at a glance.',
                color: 'from-primary-500 to-primary-700',
                shadow: 'shadow-primary-500/20',
              },
              {
                icon: Heart,
                title: 'Match',
                description:
                  'When you both swipe right, it\'s a match! Connect instantly with someone who shares your fitness goals.',
                color: 'from-rose-500 to-pink-600',
                shadow: 'shadow-rose-500/20',
              },
              {
                icon: MessageCircle,
                title: 'Train Together',
                description:
                  'Chat in real-time, coordinate your schedules, and hit the gym together. Better workouts, guaranteed.',
                color: 'from-emerald-500 to-emerald-700',
                shadow: 'shadow-emerald-500/20',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg ${feature.shadow}`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-black mb-8">
              Join the Community
            </h2>
            <div className="grid grid-cols-3 gap-8">
              {[
                { value: '10K+', label: 'Active Users' },
                { value: '5K+', label: 'Matches Made' },
                { value: '98%', label: 'Satisfaction' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl font-black mb-1">{stat.value}</p>
                  <p className="text-primary-200 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: 'Safe & Secure',
              desc: 'Your data is encrypted and never shared.',
            },
            {
              icon: Zap,
              title: 'Lightning Fast',
              desc: 'Real-time matching and instant messaging.',
            },
            {
              icon: Star,
              title: '100% Free',
              desc: 'All features free, forever. No hidden costs.',
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-primary-500" />
            <span>GymBuddy Finder © {new Date().getFullYear()}</span>
          </div>
          <p>Built with 💪 for fitness lovers</p>
        </div>
      </footer>
    </div>
  );
}
