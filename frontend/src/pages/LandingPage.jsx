import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/mentor-hero.png';

const pillars = [
  {
    icon: '🤝',
    title: 'Mentor Matching',
    desc: 'Connect with mentors whose experience, field, and guidance style align with your goals.',
  },
  {
    icon: '📋',
    title: 'Mentorship Management',
    desc: 'Organize goals, conversations, and next steps so each mentor relationship keeps moving.',
  },
  {
    icon: '📈',
    title: 'Goal Tracking & Development',
    desc: 'Turn advice into milestones across education, career, research, and personal growth.',
  },
  {
    icon: '🔍',
    title: 'Opportunity Discovery',
    desc: 'Use your profile and mentor guidance to discover scholarships, programs, jobs, and fellowships.',
  },
  {
    icon: '🌐',
    title: 'Community & Networking',
    desc: 'Build a wider support network around shared interests, pathways, and ambitions.',
  },
];

const journey = [
  {
    step: '01',
    title: 'Build a mentorship profile',
    desc: 'Capture background, goals, strengths, and the kind of guidance that would help most.',
  },
  {
    step: '02',
    title: 'Shape a guidance plan',
    desc: 'Clarify mentor priorities, development gaps, conversation topics, and next actions.',
  },
  {
    step: '03',
    title: 'Turn guidance into opportunities',
    desc: 'Discover aligned programs, prepare materials, and track progress with purpose.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-950">
      <header className="sticky top-0 z-30 border-b border-white/20 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white text-lg shadow-sm">🤝</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Mentor</p>
              <p className="font-bold text-primary-600 text-sm leading-tight">Match</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary text-sm">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <section
          className="relative min-h-[78vh] border-b border-gray-100 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.78) 34%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.34) 100%)',
            }}
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-20 min-h-[78vh] flex items-center">
            <div className="max-w-2xl">
              <p className="inline-flex items-center rounded-full bg-white/12 border border-white/20 px-3 py-1 text-sm font-semibold text-blue-100 mb-5">
                Mentorship first, opportunities next
              </p>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-5">
                Connect with the Right Mentor for Your Journey
              </h1>
              <p className="text-lg lg:text-xl text-blue-50 max-w-xl mb-8 leading-relaxed">
                Build meaningful mentor relationships, gain personalized guidance, and discover opportunities aligned with your goals.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/signup" className="bg-white text-primary-700 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors text-base">
                  Find your mentor
                </Link>
                <Link to="/login" className="border border-white/35 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base">
                  Continue journey
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                ['🤝', 'Mentor fit', 'Personalized guidance from people who understand your path.'],
                ['📈', 'Growth plan', 'Tracked next steps that turn advice into measurable progress.'],
                ['🎯', 'Opportunity path', 'Aligned discovery for scholarships, programs, jobs, and fellowships.'],
              ].map(([icon, title, desc]) => (
                <div key={title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center text-xl flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-950">{title}</h2>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-5">
            {[
              ['Mentor Matching', 'Primary experience centered on human guidance and fit.'],
              ['Goal Development', 'Structured plans that turn advice into measurable progress.'],
              ['Opportunity Discovery', 'A complementary layer for scholarships, jobs, programs, and fellowships.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-lg border border-gray-200 p-5 bg-white">
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
            <div>
              <p className="text-sm font-semibold text-primary-700 mb-2">How it works</p>
              <h2 className="text-3xl font-bold text-gray-950 leading-tight mb-4">From ambition to guided action</h2>
              <p className="text-gray-500 leading-relaxed">
                Mentor Match gives users a structured path from personal goals to mentor guidance, then extends that plan into relevant opportunity discovery and preparation.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {journey.map(({ step, title, desc }) => (
                <div key={step} className="rounded-lg border border-gray-200 p-5 bg-gray-50">
                  <p className="text-xs font-bold text-primary-600 mb-4">{step}</p>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="max-w-3xl mb-8">
              <p className="text-sm font-semibold text-primary-700 mb-2">Platform pillars</p>
              <h2 className="text-3xl font-bold text-gray-950 mb-3">A guidance ecosystem built around mentorship</h2>
              <p className="text-gray-500 leading-relaxed">
              Our platform connects aspiring individuals with experienced mentors while helping them access opportunities that support their educational, professional, and personal growth.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {pillars.map(({ icon, title, desc }, index) => (
                <div key={title} className={`rounded-lg border p-5 bg-white ${index < 3 ? 'border-primary-200' : 'border-gray-200'}`}>
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-14">
          <div className="rounded-lg bg-gray-950 text-white p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to build a mentor-guided growth path?</h2>
              <p className="text-sm text-gray-300 max-w-2xl">
                Start with a profile, clarify the right guidance, and use opportunities as the next step in a larger development journey.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/signup" className="bg-white text-gray-950 hover:bg-gray-100 font-semibold py-3 px-5 rounded-lg transition-colors">
                Get started
              </Link>
              <Link to="/login" className="border border-white/25 hover:bg-white/10 text-white font-semibold py-3 px-5 rounded-lg transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
