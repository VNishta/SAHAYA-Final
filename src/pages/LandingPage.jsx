import React from 'react';
import {
  ArrowRight,
  Grid,
  BarChart3,
  Compass,
  Database,
  CheckCircle2,
  LogIn
} from 'lucide-react';

export default function LandingPage({
  onEnterDashboard,
  storageStatus,
  onOpenAuthModal
}) {
  return (
    <div className="landing-wrapper">
      <header className="landing-nav">
        <div
          className="landing-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="brand-mark">S</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                SAHAYA
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Grades 6–10 • Indian Classrooms
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-slate">{storageStatus.label}</span>
            {storageStatus.isSupabaseConfigured && !storageStatus.isAuthenticated && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onOpenAuthModal}
              >
                <LogIn size={14} />
                Sign In
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={onEnterDashboard}>
              Open Dashboard
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section
          className="landing-section"
          style={{ background: 'var(--bg-app)', padding: '3rem 1.5rem' }}
        >
          <div className="landing-container">
            <span className="badge badge-navy" style={{ marginBottom: '0.75rem' }}>
              Teacher-Assisted Adaptive Learning System
            </span>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                maxWidth: '760px',
                lineHeight: 1.25
              }}
            >
              Identify classroom learning gaps from paper assessments in minutes.
            </h1>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                maxWidth: '680px',
                marginTop: '0.75rem'
              }}
            >
              Designed for Indian classrooms in Grades 6–10. Students answer short multiple-choice
              questions on paper without individual devices. Teachers record responses in a pre-marked
              digital grid to analyze concept-level accuracy and group students by learning path.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '1.5rem',
                flexWrap: 'wrap'
              }}
            >
              <button type="button" className="btn btn-primary" onClick={onEnterDashboard}>
                Open Dashboard
                <ArrowRight size={16} />
              </button>
              {storageStatus.isSupabaseConfigured && !storageStatus.isAuthenticated && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onOpenAuthModal}
                >
                  <LogIn size={15} />
                  Teacher Sign In
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="landing-section" aria-labelledby="features-heading">
          <div className="landing-container">
            <h2
              id="features-heading"
              style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.1rem' }}
            >
              Core Features
            </h2>
            <div className="grid-4">
              <article className="card">
                <Grid size={20} color="#1e3a8a" style={{ marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Paper-First Response Grid
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  All responses start pre-marked as Correct. Click or use keyboard shortcuts only to
                  mark incorrect or unanswered items.
                </p>
              </article>

              <article className="card">
                <BarChart3 size={20} color="#0284c7" style={{ marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Concept-Level Analysis
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Questions are tagged by concept and prerequisite status to detect specific gaps
                  across the class and per student.
                </p>
              </article>

              <article className="card">
                <Compass size={20} color="#0d9488" style={{ marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Rule-Based Learning Paths
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Deterministic rules assign students to Relearn Fundamentals, Practise, Advance, or
                  Needs Confirmation with clear reasons.
                </p>
              </article>

              <article className="card">
                <Database size={20} color="#b45309" style={{ marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Reliable Persistence
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Supports cloud synchronization with Supabase PostgreSQL and offline-ready local
                  browser persistence via IndexedDB.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Workflow Summary */}
        <section className="landing-section" aria-labelledby="workflow-heading">
          <div className="landing-container">
            <h2
              id="workflow-heading"
              style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}
            >
              Classroom Workflow
            </h2>
            <div className="grid-4">
              {[
                {
                  step: '1. Create Assessment',
                  text: 'Build a short concept-tagged MCQ sheet for Grades 6–10 and print or write on the board.'
                },
                {
                  step: '2. Students Answer on Paper',
                  text: 'Students solve questions on paper. No student phones, tablets, or accounts needed.'
                },
                {
                  step: '3. Record Responses',
                  text: 'Mark only incorrect or blank answers in the response grid with automatic saving.'
                },
                {
                  step: '4. Adapt Instruction',
                  text: 'Review flagged class concepts and group students by recommended learning path.'
                }
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    padding: '0.9rem 1rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: 'var(--primary-navy)',
                      marginBottom: '0.3rem'
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>{item.step}</span>
                  </div>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Structured FAQ Section (AEO / GEO) */}
        <section
          className="landing-section"
          style={{ borderBottom: 'none' }}
          aria-labelledby="faq-heading"
        >
          <div className="landing-container">
            <h2
              id="faq-heading"
              style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}
            >
              Frequently Asked Questions
            </h2>
            <div className="grid-2">
              <div className="faq-item">
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  What is SAHAYA?
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  SAHAYA is a teacher-assisted adaptive learning system for Indian classrooms (Grades
                  6–10) that helps teachers identify concept-level learning gaps from short paper
                  assessments.
                </p>
              </div>

              <div className="faq-item">
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  Do students need individual devices?
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  No. Students complete assessments on paper. Only the teacher uses a single computer,
                  tablet, or phone to enter responses and review analytics.
                </p>
              </div>

              <div className="faq-item">
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  How are learning recommendations determined?
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  A deterministic rule-based engine evaluates overall score, concept-tag accuracy,
                  prerequisite concept mastery, and answered count against configurable thresholds
                  (default: &lt;50% Relearn, 50–79% Practise, &ge;80% Advance).
                </p>
              </div>

              <div className="faq-item">
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  Does SAHAYA work without AI or internet access?
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Yes. Core assessment, response entry, adaptive analysis, and local IndexedDB
                  persistence work completely offline without any external AI dependency.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1.1rem 1.5rem',
          background: 'var(--bg-app)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        <div
          className="landing-container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <span>SAHAYA — Teacher-Assisted Adaptive Learning System (Grades 6–10)</span>
          <span>Paper-First Classroom Assessment & Concept Gap Analysis</span>
        </div>
      </footer>
    </div>
  );
}
