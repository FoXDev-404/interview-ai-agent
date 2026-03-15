import { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Gauge, Shield, Sparkles, Target, Users } from "lucide-react";
import TeamCarousel from "@/components/TeamCarousel";

export const metadata: Metadata = {
  title: "About Us | AI MockPrep",
  description: "Learn about AI MockPrep - the advanced AI-powered interview preparation platform",
};

const teamMembers = [
  {
    name: "Alex Morgan",
    role: "Product & AI Strategy Lead",
    image: "/avatars/agent-alex.png",
    vision:
      "Build an interview platform that gives every learner actionable, role-specific coaching powered by practical AI insights.",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  },
  {
    name: "Maya Chen",
    role: "Experience Design Lead",
    image: "/avatars/agent-maya.png",
    vision:
      "Design calm, confidence-boosting practice flows that make preparation feel structured, personal, and motivating.",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  },
  {
    name: "John Patel",
    role: "Backend & Platform Engineer",
    image: "/avatars/agent-john.png",
    vision:
      "Ensure fast, reliable interview simulations and feedback pipelines that scale smoothly for users in production.",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  },
  {
    name: "Riya Sharma",
    role: "Career Intelligence Specialist",
    image: "/avatars/agent-maya.png",
    vision:
      "Translate hiring expectations into measurable guidance so users can improve communication, technical depth, and outcomes.",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  },
];

const capabilityItems = [
  {
    title: "Adaptive Interview Engine",
    description:
      "Context-aware interview flows adjust to role, level, and response quality for realistic preparation.",
    icon: Sparkles,
    accent: "text-blue-300",
  },
  {
    title: "Performance Intelligence",
    description:
      "Detailed scoring surfaces communication clarity, problem-solving depth, and technical confidence in one view.",
    icon: Gauge,
    accent: "text-cyan-300",
  },
  {
    title: "Secure by Design",
    description:
      "Private session handling and protected backend integrations keep user practice data safe and reliable.",
    icon: Shield,
    accent: "text-emerald-300",
  },
];

const impactStats = [
  { label: "Interview Domains", value: "12+" },
  { label: "Feedback Dimensions", value: "20+" },
  { label: "Practice Modes", value: "Voice + Text" },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-indigo-900/40 p-8 md:p-12 mb-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 grid lg:grid-cols-[1.25fr_0.75fr] gap-8 items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase text-blue-200 mb-5">
              <Target className="w-3.5 h-3.5" />
              About AI MockPrep
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight max-w-3xl bg-gradient-to-r from-blue-200 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
              Premium interview readiness, built for modern hiring standards.
            </h1>

            <p className="mt-5 text-gray-300 text-lg leading-relaxed max-w-2xl">
              We combine adaptive AI interviews, precision feedback, and coaching clarity into one focused
              platform so candidates can practice with purpose and perform with confidence.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-blue-200/85 mb-4">Impact Snapshot</p>
            <div className="space-y-4">
              {impactStats.map((stat) => (
                <div key={stat.label} className="flex justify-between items-end gap-3 border-b border-white/10 pb-3 last:border-none last:pb-0">
                  <span className="text-sm text-gray-300">{stat.label}</span>
                  <span className="text-white font-semibold text-lg tracking-tight">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-blue-300" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">What Sets Us Apart</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {capabilityItems.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-gray-900/55 p-6 hover:border-blue-400/40 transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Icon className={`w-5 h-5 ${item.accent}`} />
                  <h3 className="text-xl font-semibold text-white leading-tight">{item.title}</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-800/45 rounded-2xl border border-white/10 p-8 mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Our Team</h2>
        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          A focused group of product builders, AI engineers, and career specialists driving measurable interview outcomes.
        </p>
        <TeamCarousel members={teamMembers} />
      </section>

      <section className="rounded-3xl border border-blue-400/25 bg-gradient-to-r from-blue-700/35 via-indigo-700/30 to-cyan-700/25 p-8 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Train sharper. Interview better.</h2>
            <p className="text-blue-100/90 max-w-2xl">
              Start a focused preparation flow and get high-signal feedback in minutes.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap md:justify-end">
            <Link
              href="/sign-up"
              className="inline-flex min-w-40 justify-center items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Free
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex min-w-40 justify-center items-center border border-white/50 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
