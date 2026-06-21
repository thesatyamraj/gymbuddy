import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell, Heart, Users, MessageCircle, ArrowRight, Zap, Shield, Star,
  MapPin, Clock,
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

/**
 * Public landing page with hero section, features, and CTA
 * FITNEX-inspired dark athletic theme.
 */
export default function LandingPage() {
  const steps = [
    {
      num: '01',
      icon: Users,
      title: 'Swipe',
      description:
        'Browse training partners near you. Gym, workout style, and schedule, all at a glance.',
    },
    {
      num: '02',
      icon: Heart,
      title: 'Match',
      description:
        'Swipe right on each other and it\u2019s a match. Connect instantly with people chasing the same goals.',
    },
    {
      num: '03',
      icon: MessageCircle,
      title: 'Train Together',
      description:
        'Chat in real time, lock in your schedule, and hit the gym together. Show up, every time.',
    },
  ];

  return (
    <div className="min-h-screen bg-ink text-slate-900 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-wide uppercase text-slate-900">
              Gym<span className="text-primary-500">Buddy</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-glow hover:shadow-glow-strong transition-all uppercase tracking-wide"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-4 bg-gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:22px_22px] opacity-40" />

        <div className="max-w-7xl mx-auto relative grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full border border-primary-200 bg-primary-50 text-primary-400 text-xs font-bold uppercase tracking-[0.18em]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              No solo sets. No excuses.
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display uppercase font-bold leading-[0.92] tracking-tightest text-6xl sm:text-7xl lg:text-8xl text-slate-900 mb-6"
            >
              Find your
              <br />
              <span className="text-gradient">training partner</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed"
            >
              Swipe, match, and train together. Connect with people who share
              your gym, your workout style, and your schedule.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link
                to="/signup"
                className="group w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-bold uppercase tracking-wide rounded-2xl hover:bg-primary-700 shadow-glow hover:shadow-glow-strong transition-all flex items-center justify-center gap-2"
              >
                Start Swiping Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-800 font-bold uppercase tracking-wide rounded-2xl border border-slate-200 hover:bg-slate-200 transition-colors text-center"
              >
                I Have an Account
              </Link>
            </motion.div>

            {/* mini stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid grid-cols-3 max-w-md mx-auto lg:mx-0 divide-x divide-slate-200"
            >
              {[
                { value: '10K+', label: 'Members' },
                { value: '5K+', label: 'Matches' },
                { value: '4.9', label: 'Rating' },
              ].map((s) => (
                <div key={s.label} className="px-2 text-center lg:text-left">
                  <p className="font-display text-3xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: product preview (stacked swipe cards) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block h-[460px]"
          >
            <div className="absolute right-6 top-6 w-72 h-[400px] rounded-3xl bg-surface-raised border border-slate-200 rotate-6" />
            <div className="absolute right-3 top-3 w-72 h-[400px] rounded-3xl bg-surface border border-slate-200 rotate-3" />
            <div className="absolute right-0 top-0 w-72 h-[400px] rounded-3xl overflow-hidden border border-slate-200 swipe-card-shadow bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(226,75,74,0.35),transparent_60%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Dumbbell className="w-28 h-28 text-white/10" />
              </div>
              <div className="absolute inset-0 bg-gradient-card" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-3xl font-bold uppercase text-white tracking-wide">
                  Alex, 26
                </h3>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {[
                    { icon: MapPin, text: 'Iron House Gym' },
                    { icon: Dumbbell, text: 'Powerlifting' },
                    { icon: Clock, text: 'Mornings' },
                  ].map((c) => (
                    <span
                      key={c.text}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/15"
                    >
                      <c.icon className="w-3 h-3" />
                      {c.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* like badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-3 top-24 w-16 h-16 rounded-2xl bg-primary-600 shadow-glow flex items-center justify-center rotate-[-12deg]"
            >
              <Heart className="w-8 h-8 text-white" fill="white" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 max-w-2xl"
          >
            <p className="text-primary-500 font-bold uppercase tracking-[0.2em] text-xs mb-3">
              How it works
            </p>
            <h2 className="font-display uppercase font-bold tracking-tight text-5xl sm:text-6xl text-slate-900 leading-[0.95]">
              Three steps to a<br />better workout.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="group relative bg-surface border border-slate-200 rounded-3xl p-8 card-hover-lift overflow-hidden"
              >
                <span className="absolute -top-4 -right-2 font-display text-[8rem] leading-none font-bold text-slate-100/60 select-none pointer-events-none">
                  {feature.num}
                </span>
                <div className="relative">
                  <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-glow">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-3xl font-bold uppercase tracking-wide text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / CTA band */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-primary-300 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(226,75,74,0.5),transparent_60%)]" />
            <div className="relative">
              <h2 className="font-display uppercase font-bold tracking-tight text-4xl sm:text-5xl text-white mb-3">
                Join the community
              </h2>
              <p className="text-white/70 mb-10 max-w-md mx-auto">
                Thousands of lifters have already found their person. You're next.
              </p>
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                {[
                  { value: '10K+', label: 'Active Members' },
                  { value: '5K+', label: 'Matches Made' },
                  { value: '98%', label: 'Satisfaction' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-5xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-white/60 text-xs uppercase tracking-[0.15em]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Safe & Secure', desc: 'Your data is encrypted and never sold. Period.' },
            { icon: Zap, title: 'Lightning Fast', desc: 'Real-time matching and instant messaging.' },
            { icon: Star, title: '100% Free', desc: 'Every feature, free forever. No hidden costs.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="w-11 h-11 bg-primary-50 border border-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1 uppercase tracking-wide text-sm">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 bg-ink">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-primary-500" />
            <span className="font-display uppercase tracking-wide text-slate-700 font-semibold">
              GymBuddy Finder
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <p>Built for people who never skip leg day.</p>
        </div>
      </footer>
    </div>
  );
}
