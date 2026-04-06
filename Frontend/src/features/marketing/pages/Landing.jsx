import { Link } from "react-router";
import "../style/landing.scss";
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>

import { useEffect, useRef, useState } from "react";


// ─── DATA ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "⚡",
    title: "AI-Powered Strategy",
    desc: "Claude analyzes your job description and profile to craft a personalized, data-driven interview roadmap in ~30 seconds.",
  },
  {
    icon: "📄",
    title: "Resume Upload",
    desc: "Drop your PDF or DOCX resume. The AI extracts your skills, experience, and achievements to tailor every recommendation.",
  },
  {
    icon: "✍️",
    title: "Quick Self-Description",
    desc: "No resume? No problem. A short self-description is enough for the AI to build a precise, winning strategy just for you.",
  },
  {
    icon: "📊",
    title: "Match Score",
    desc: "Every plan includes a Match Score showing how well your profile aligns to the target role — so you know exactly where you stand.",
  },
  {
    icon: "📋",
    title: "Full Interview Report",
    desc: "Downloadable PDF report covering key competencies, likely questions, suggested answers, and prep tips.",
  },
  {
    icon: "📁",
    title: "Plan History",
    desc: "All your generated strategies are saved. Revisit, compare, and refine plans for every job you apply to.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Paste the Job Description",
    body: "Copy the role's requirements — up to 5,000 characters — directly into the form. The AI reads every detail.",
  },
  {
    num: "02",
    title: "Upload Resume or Describe Yourself",
    body: "Attach a PDF/DOCX resume or type a quick self-description. One of the two is required for personalization.",
  },
  {
    num: "03",
    title: "Generate Your Strategy",
    body: "Hit 'Generate'. The AI cross-references your profile against the job in ~30 seconds.",
  },
  {
    num: "04",
    title: "Review & Download",
    body: "Explore your plan in-app or download a polished PDF report to study offline before the big day.",
  },
];

const AUTH_ROUTES = [
  { method: "POST", path: "/api/auth/register" },
  { method: "POST", path: "/api/auth/login" },
  { method: "GET",  path: "/api/auth/logout" },
  { method: "GET",  path: "/api/auth/get-me" },
];

const INTERVIEW_ROUTES = [
  { method: "GET",  path: "/api/interview/" },
  { method: "POST", path: "/api/interview/  (multipart)" },
  { method: "GET",  path: "/api/interview/report/:id" },
  { method: "POST", path: "/api/interview/resume/pdf/:id" },
];

const API_CODE = `POST /api/interview/
Content-Type: multipart/form-data

jobDescription: "Senior React Engineer..."
selfDescription: "4 years React, Node.js..."
resume: resume.pdf (optional)

──────────────────────────
Response 200

{
  "matchScore": 92,
  "planId": "plan_abc123",
  "summary": "Strong React match...",
  "pdfUrl": "/resume/pdf/plan_abc123"
}`;

// ─── HOOKS ───────────────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────

function Reveal({ children, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={`reveal ${visible ? "revealed" : ""} ${className}`}>
      {children}
    </div>
  );
}

function SectionTag({ children, pink = false }) {
  return (
    <span className={`section-tag${pink ? " section-tag--pink" : ""}`}>
      {children}
    </span>
  );
}

function MethodBadge({ method }) {
  return (
    <span className={`method-badge method-badge--${method.toLowerCase()}`}>
      {method}
    </span>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        NexPrep-<span>AI</span>
      </div>

      <ul className="navbar__links">
        {["Features", "How It Works", "API"].map((link) => (
          <li key={link}>
            <a href={`#${link.toLowerCase().replace(/ /g, "")}`}>{link}</a>
          </li>
        ))}
      </ul>
       
      {/* Link to login page */}
      <Link to="/login" className="navbar__cta btn btn--primary">
        Get Started →
      </Link>
      
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero__bg" />

      <div className="hero__tag">
        <span className="hero__tag-dot" />
        AI-Powered Interview Prep
      </div>

      <h1 className="hero__title">
        Win Every Interview
        <br />
        with an <em>AI Strategy</em>
        <br />
        Built for You
      </h1>

      <p className="hero__sub">
        Paste a job description, upload your resume, and get a fully personalized
        interview plan — complete with match score and downloadable PDF report — in
        about 30 seconds.
      </p>

      <div className="hero__btns">
        <a href="#howitworks" className="btn btn--primary">See How It Works</a>
        <a href="#features"   className="btn btn--outline">Explore Features</a>
      </div>

      <div className="hero__stats">
        {[
          ["~30s", "Strategy Generation"],
          ["92%",  "Top Match Score"],
          ["5K+",  "Chars Analyzed"],
        ].map(([val, label]) => (
          <div key={label} className="stat">
            <div className="stat__num">{val}</div>
            <div className="stat__label">{label}</div>
          </div>
        ))}
      </div>

      <div className="hero__card mock-card">
        <div className="mock-card__top">
          <span className="mock-card__dot mock-card__dot--pink" />
          <span className="mock-card__dot mock-card__dot--yellow" />
          <span className="mock-card__dot mock-card__dot--green" />
          <span className="mock-card__label">InterviewAI App</span>
        </div>

        <div className="mock-card__field">
          <strong>Target Job Description</strong>
          We are looking for a Senior Frontend Engineer with 5+ years of React experience…
        </div>

        <div className="mock-card__upload">
          📎 Upload Resume
          <span>PDF or DOCX · Max 5MB</span>
        </div>

        <div className="mock-card__divider">OR</div>

        <div className="mock-card__field">
          <strong>Quick Self-Description</strong>
          Full-stack developer, 4 years React &amp; Node.js, open source contributor…
        </div>

        <button className="mock-card__btn">
          ⚡ Generate My Interview Strategy
          <span className="match-badge">92% Match</span>
        </button>
      </div>
    </section>
  );
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section className="features" id="features">
      <SectionTag>Features</SectionTag>
      <h2 className="features__title">
        Everything You Need to <em>Nail</em> the Interview
      </h2>

      <Reveal className="features__grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <span className="feature-card__icon">{f.icon}</span>
            <div className="feature-card__title">{f.title}</div>
            <div className="feature-card__desc">{f.desc}</div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section className="how" id="howitworks">
      <SectionTag pink>How It Works</SectionTag>
      <h2 className="how__title">
        Four Steps to Your <em>Winning</em> Strategy
      </h2>

      <Reveal className="how__steps">
        {STEPS.map((s) => (
          <div key={s.num} className="step-card">
            <div className="step-card__num">{s.num}</div>
            <div className="step-card__title">{s.title}</div>
            <div className="step-card__body">{s.body}</div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}


// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="cta" id="cta">
      <h2 className="cta__title">
        Ready to <em>Ace</em> Your
        <br />
        Next Interview?
      </h2>
      <p className="cta__sub">
        Join hundreds of candidates who walked in prepared, confident, and with
        a strategy built exactly for them.
      </p>
      <a href="#home" className="btn btn--white">
        Generate My Strategy — It's Free →
      </a>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__logo">
        Interview<span>AI</span>
      </div>
      <p className="footer__copy">Built with ❤️ · Powered by Claude AI</p>
      <p className="footer__copy">© 2026 InterviewAI. All rights reserved.</p>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
    
      <CTA />
      <Footer />
    </>
  );
}


