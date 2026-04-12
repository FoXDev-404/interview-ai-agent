import { Button } from '@/components/ui/button'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import InterviewCard from '@/components/InterviewCard'
import FaangCard from '@/components/FaangCard'
import LeaderboardTopWidget from '@/components/LeaderboardTopWidget'
import HomeAuthAutoRefresh from '@/components/HomeAuthAutoRefresh'
import { getUserInterviews } from '@/lib/actions/interview.action'
import { getLeaderboardSnapshot } from '@/lib/actions/leaderboard.action'
import { getCurrentUser } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const faangCompanies = [
  {
    name: 'Google',
    logo: '/covers/google.svg',
    description: 'System design, algorithms & coding challenges',
    techstack: ['TypeScript', 'Python', 'Go', 'Kubernetes'],
    role: 'Software Engineer',
    type: 'Technical',
    glow: '#4285f4',
  },
  {
    name: 'Amazon',
    logo: '/covers/amazon.png',
    description: 'Leadership principles & scalable systems',
    techstack: ['Java', 'AWS', 'Python', 'React'],
    role: 'Software Developer',
    type: 'Mixed',
    glow: '#ff9900',
  },
  {
    name: 'Meta',
    logo: '/covers/facebook.png',
    description: 'Product sense, coding & behavioral rounds',
    techstack: ['React', 'GraphQL', 'Python', 'TypeScript'],
    role: 'Frontend Engineer',
    type: 'Technical',
    glow: '#0668E1',
  },
  {
    name: 'Apple',
    logo: '/covers/apple.svg',
    description: 'Deep technical knowledge & innovation focus',
    techstack: ['Swift', 'Objective-C', 'Python', 'C++'],
    role: 'Software Engineer',
    type: 'Technical',
    glow: '#a2aaad',
  },
  {
    name: 'Netflix',
    logo: '/covers/netflix.svg',
    description: 'Culture fit, distributed systems & streaming',
    techstack: ['Java', 'Python', 'React', 'Node.js'],
    role: 'Senior Engineer',
    type: 'Mixed',
    glow: '#e50914',
  },
  {
    name: 'Microsoft',
    logo: '/covers/microsoft.svg',
    description: 'Problem solving, cloud & system design',
    techstack: ['C#', 'Azure', 'TypeScript', 'Python'],
    role: 'Software Engineer',
    type: 'Technical',
    glow: '#00a4ef',
  },
];

const steps = [
  {
    number: '01',
    title: 'Choose Your Path',
    description: 'Select a company, role, and tech stack — or let AI tailor a session for you.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Practice with AI',
    description: 'Our AI interviewer asks real questions, listens to your answers, and adapts in real-time.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Get Detailed Feedback',
    description: 'Receive scores, strengths, weaknesses, and actionable tips to level up fast.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

const stats = [
  { value: '10K+', label: 'Mock Interviews' },
  { value: '95%', label: 'Success Rate' },
  { value: '6+', label: 'FAANG Companies' },
  { value: '24/7', label: 'AI Available' },
];

const page = async () => {
  const user = await getCurrentUser();

  let userInterviews: Interview[] = [];
  let topLeaderboardUsers: LeaderboardEntry[] = [];

  const leaderboardResult = await getLeaderboardSnapshot({
    limit: 3,
    currentUserId: user?.uid,
  });
  if (leaderboardResult.success) {
    topLeaderboardUsers = leaderboardResult.topUsers;
  }

  if (user) {
    const userInterviewsResult = await getUserInterviews(user.uid);
    userInterviews = userInterviewsResult.success ? userInterviewsResult.interviews : [];
  }

  return (
    <>
      <HomeAuthAutoRefresh />
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="hero-section relative overflow-hidden rounded-3xl">
        {/* Animated gradient orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="relative z-10 flex items-center justify-between gap-8 px-10 py-14 max-sm:px-5 max-sm:py-10">
          <div className="flex flex-col gap-5 max-w-2xl">
            <span className="hero-pill">
              <span className="hero-pill-dot" />
              AI-Powered Interview Prep
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.12] tracking-tight">
              Ace Your Next
              <span className="hero-gradient-text"> Dream Job </span>
              Interview
            </h1>

            <p className="text-base sm:text-lg text-light-100/80 leading-relaxed max-w-xl">
              Practice with an AI interviewer that adapts to your skill level, gives real-time feedback, and helps you land offers at top companies.
            </p>

            <div className="flex items-center gap-3 mt-2 max-sm:flex-col max-sm:w-full">
              <Button asChild className="btn-primary !px-7 !py-3 !text-base max-sm:w-full">
                <Link href={user ? '/interview' : '/sign-in'}>
                  {user ? 'Start an Interview' : 'Get Started Free'}
                </Link>
              </Button>
              <Button asChild className="btn-secondary !px-7 !py-3 !text-base max-sm:w-full">
                <Link href={user ? '/resume-builder' : '/sign-in'}>
                  {user ? 'Build Resume' : 'Learn More'}
                </Link>
              </Button>
            </div>
          </div>

          <Image
            src="/robot.png"
            alt="AI Interview Assistant"
            width={380}
            height={380}
            className="max-lg:hidden hero-float"
          />
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────── */}
      <section className="stats-bar">
        {stats.map((stat, i) => (
          <React.Fragment key={stat.label}>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</span>
              <span className="text-xs sm:text-sm text-light-400">{stat.label}</span>
            </div>
            {i < stats.length - 1 && (
              <div className="w-px h-10 bg-light-600/30 max-sm:hidden" />
            )}
          </React.Fragment>
        ))}
      </section>

      {/* ── LEADERBOARD PREVIEW ─────────────────────────── */}
      <section className="mt-4">
        <LeaderboardTopWidget users={topLeaderboardUsers} />
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="flex flex-col items-center gap-10 mt-4">
        <div className="text-center max-w-2xl">
          <p className="section-label">How It Works</p>
          <h2 className="mt-2">Three Steps to <span className="hero-gradient-text">Interview Success</span></h2>
          <p className="mt-3 text-light-400">No signup friction. Pick a path, practice, and improve — all powered by AI.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
          {steps.map((step) => (
            <div key={step.number} className="step-card group">
              <div className="step-card-number">{step.number}</div>
              <div className="step-card-icon">{step.icon}</div>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">{step.title}</h3>
              <p className="text-sm text-light-100/70 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAANG COMPANIES ───────────────────────────────── */}
      <section className="flex flex-col items-center gap-8 mt-4">
        <div className="text-center max-w-2xl">
          <p className="section-label">Top Companies</p>
          <h2 className="mt-2">Practice for <span className="hero-gradient-text">FAANG</span> & Beyond</h2>
          <p className="mt-3 text-light-400">Tailored mock interviews for the world&apos;s most competitive tech companies.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {faangCompanies.map((company) => {
            const interviewUrl = user
              ? `/interview?${new URLSearchParams({ company: company.name, role: company.role, type: company.type.toLowerCase(), level: 'senior', techstack: company.techstack.join(',') }).toString()}`
              : '/sign-in';

            return (
              <FaangCard
                key={company.name}
                name={company.name}
                logo={company.logo}
                description={company.description}
                techstack={company.techstack}
                role={company.role}
                type={company.type}
                glowColor={company.glow}
                interviewUrl={interviewUrl}
              />
            );
          })}
        </div>
      </section>

      {/* ── RECENT INTERVIEWS (logged in) ─────────────────── */}
      {user && userInterviews.length > 0 && (
        <section className="flex flex-col gap-6 mt-4">
          <div>
            <p className="section-label">Your Activity</p>
            <h2 className="mt-2">Recent Interviews</h2>
          </div>
          <div className="interviews-section">
            {userInterviews.slice(0, 3).map((interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={interview.userId}
                company={interview.company}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ────────────────────────────────────── */}
      <section className="cta-bottom mt-12">
        <div className="cta-bottom-glow" />
        <div className="relative z-10 flex flex-col items-center text-center gap-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Land Your <span className="hero-gradient-text">Dream Job</span>?
          </h2>
          <p className="text-light-100/70 max-w-lg">
            Join thousands of developers who aced their interviews with AI-powered practice. Start for free today.
          </p>
          <div className="flex gap-3 max-sm:flex-col max-sm:w-full">
            <Button asChild className="btn-primary !px-8 !py-3 !text-base max-sm:w-full">
              <Link href={user ? '/interview' : '/sign-in'}>
                {user ? 'Start Practicing Now' : 'Get Started Free'}
              </Link>
            </Button>
            <Button asChild className="btn-secondary !px-8 !py-3 !text-base max-sm:w-full">
              <Link href={user ? '/resume-builder' : '/sign-in'}>
                {user ? 'Build Resume' : 'See How It Works'}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

export default page
