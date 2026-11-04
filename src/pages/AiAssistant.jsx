import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  FilePlus2,
  Info,
  CheckCircle2,
  Users
} from 'lucide-react';
import {
  generateDemoTeachingSuggestions,
  fetchLiveProxySuggestions
} from '../engine/aiAssistantEngine';
import { LEARNING_PATHS } from '../engine/adaptiveEngine';
import { SUGGESTED_CONCEPT_TAGS } from '../data/demoData';

export default function AiAssistant({
  activeClass,
  classInsights,
  settings,
  initialConceptTag,
  onCreateFollowUpAssessment
}) {
  const conceptInsights = classInsights?.conceptInsights || [];
  const defaultTags =
    conceptInsights.length > 0
      ? conceptInsights.map((c) => c.conceptTag)
      : SUGGESTED_CONCEPT_TAGS[activeClass?.subject || 'Mathematics'] || [
          'Unlike Fraction Addition',
          'Equivalent Fractions',
          'Fraction-Decimal Conversion'
        ];

  const [selectedConcept, setSelectedConcept] = useState(
    initialConceptTag || defaultTags[0] || 'Unlike Fraction Addition'
  );
  const [customConceptInput, setCustomConceptInput] = useState('');
  const [suggestionResult, setSuggestionResult] = useState(null);
  const [loadingProxy, setLoadingProxy] = useState(false);
  const [proxyError, setProxyError] = useState('');

  useEffect(() => {
    if (initialConceptTag) {
      setSelectedConcept(initialConceptTag);
    }
  }, [initialConceptTag]);

  const activeConceptTag = customConceptInput.trim() || selectedConcept;
  const matchedInsight = conceptInsights.find((c) => c.conceptTag === activeConceptTag);

  const relearnCount =
    classInsights?.pathDistribution?.[LEARNING_PATHS.RELEARN.id]?.length || 0;
  const practiseCount =
    classInsights?.pathDistribution?.[LEARNING_PATHS.PRACTISE.id]?.length || 0;
  const advanceCount =
    classInsights?.pathDistribution?.[LEARNING_PATHS.ADVANCE.id]?.length || 0;

  useEffect(() => {
    const demoData = generateDemoTeachingSuggestions({
      conceptTag: activeConceptTag,
      grade: activeClass?.grade || 'Class 7',
      subject: activeClass?.subject || 'Mathematics',
      classAccuracy: matchedInsight ? matchedInsight.accuracy : 50,
      relearnCount,
      practiseCount,
      advanceCount,
      classification: matchedInsight ? matchedInsight.classification : 'Concept Review'
    });
    setSuggestionResult(demoData);
    setProxyError('');
  }, [
    activeConceptTag,
    activeClass?.id,
    matchedInsight?.accuracy,
    relearnCount,
    practiseCount,
    advanceCount
  ]);

  const handleRequestLiveProxy = async () => {
    if (!settings?.aiProxyUrl) return;
    setLoadingProxy(true);
    setProxyError('');
    try {
      const liveData = await fetchLiveProxySuggestions(settings.aiProxyUrl, {
        conceptTag: activeConceptTag,
        grade: activeClass?.grade || 'Class 7',
        subject: activeClass?.subject || 'Mathematics',
        classAccuracy: matchedInsight ? matchedInsight.accuracy : 50,
        relearnCount,
        practiseCount,
        advanceCount,
        classification: matchedInsight?.classification || 'Concept Review'
      });
      setSuggestionResult(liveData);
    } catch (err) {
      setProxyError(`Backend AI service unreachable (${err.message}). Using local template.`);
    } finally {
      setLoadingProxy(false);
    }
  };

  const handleBuildFollowUpCheckpoint = () => {
    if (!suggestionResult?.followUpQuestions) return;
    onCreateFollowUpAssessment({
      title: `Reassessment: ${suggestionResult.conceptTag}`,
      grade: activeClass?.grade || 'Class 7',
      subject: activeClass?.subject || 'Mathematics',
      topic: suggestionResult.conceptTag,
      questions: suggestionResult.followUpQuestions
    });
  };

  const isLiveConfigured = Boolean(settings?.aiProxyUrl);

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h1 className="page-title">AI Teaching Assistant</h1>
            <span className="badge badge-slate">Optional Support</span>
            <span
              className={`badge ${
                suggestionResult?.mode === 'LIVE_PROXY_MODE' ? 'badge-teal' : 'badge-amber'
              }`}
            >
              {suggestionResult?.mode === 'LIVE_PROXY_MODE'
                ? 'Connected Backend AI'
                : 'Offline Demo Templates (No Live AI Configured)'}
            </span>
          </div>
          <p className="page-subtitle">
            Concept explanations, misconceptions, worked examples, and practice activities
          </p>
        </div>
      </div>

      {!isLiveConfigured && (
        <div className="callout callout-amber" style={{ padding: '0.65rem 0.9rem', fontSize: '0.82rem' }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <span>
            <strong>No external AI service configured:</strong> Displaying deterministic pedagogical
            templates based on class concept insights. Configure a backend proxy in Settings to
            enable live AI generation.
          </span>
        </div>
      )}

      {/* Concept Selector */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="grid-2" style={{ alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="ai-concept-select">
              Concept
            </label>
            <select
              id="ai-concept-select"
              className="form-select"
              style={{ fontWeight: 600 }}
              value={selectedConcept}
              onChange={(e) => {
                setSelectedConcept(e.target.value);
                setCustomConceptInput('');
              }}
            >
              {conceptInsights.map((c) => (
                <option key={c.conceptTag} value={c.conceptTag}>
                  {c.conceptTag} ({c.accuracy}% Accuracy • {c.studentsStrugglingCount} struggling)
                </option>
              ))}
              {SUGGESTED_CONCEPT_TAGS[activeClass?.subject || 'Mathematics']
                ?.filter((t) => !conceptInsights.some((c) => c.conceptTag === t))
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="ai-custom-concept">
              Custom Concept
            </label>
            <input
              id="ai-custom-concept"
              type="text"
              className="form-input"
              placeholder="Or enter a concept..."
              value={customConceptInput}
              onChange={(e) => setCustomConceptInput(e.target.value)}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: '0.85rem',
            padding: '0.55rem 0.85rem',
            background: 'var(--bg-slate-subtle)',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.8rem'
          }}
        >
          <span>
            <strong>Context:</strong> {activeConceptTag} •{' '}
            {matchedInsight ? `${matchedInsight.accuracy}% Class Accuracy` : 'Custom Topic'} •{' '}
            {relearnCount} Relearn / {practiseCount} Practise / {advanceCount} Advance
          </span>

          {isLiveConfigured && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRequestLiveProxy}
              disabled={loadingProxy}
            >
              <Sparkles size={13} />
              {loadingProxy ? 'Generating...' : 'Generate via Backend Proxy'}
            </button>
          )}
        </div>

        {proxyError && (
          <div style={{ color: '#be123c', fontSize: '0.8rem', marginTop: '0.45rem' }}>
            {proxyError}
          </div>
        )}
      </div>

      {suggestionResult && (
        <>
          <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
            {/* Explanation, Misconception & Worked Example */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <BookOpen size={17} color="#1e3a8a" />
                  Concept Explanation & Worked Example
                </h2>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--primary-navy)',
                    textTransform: 'uppercase'
                  }}
                >
                  Simple Explanation
                </div>
                <p style={{ fontSize: '0.86rem', marginTop: '0.2rem' }}>
                  {suggestionResult.analogy}
                </p>
              </div>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '6px',
                  marginBottom: '0.85rem'
                }}
              >
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#b45309',
                    textTransform: 'uppercase'
                  }}
                >
                  Common Misconception
                </div>
                <p style={{ fontSize: '0.83rem', marginTop: '0.15rem', color: '#78350f' }}>
                  {suggestionResult.commonMisconception}
                </p>
              </div>

              {suggestionResult.workedExample && (
                <div
                  style={{
                    padding: '0.75rem 0.9rem',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', marginBottom: '0.35rem' }}>
                    Worked Example: {suggestionResult.workedExample.problem}
                  </div>
                  <ol
                    style={{
                      paddingLeft: '1.15rem',
                      fontSize: '0.82rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    {suggestionResult.workedExample.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Practice Activities & Interventions */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Users size={17} color="#0284c7" />
                  Practice Activities & Classroom Interventions
                </h2>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  marginBottom: '0.9rem'
                }}
              >
                <div
                  style={{
                    padding: '0.65rem',
                    background: 'var(--bg-amber-subtle)',
                    border: '1px solid var(--amber-border)',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--amber-text)' }}>
                    Relearn Fundamentals ({relearnCount})
                  </div>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.15rem' }}>
                    {suggestionResult.activities?.relearn}
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.65rem',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--blue-border)',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--blue-text)' }}>
                    Practise ({practiseCount})
                  </div>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.15rem' }}>
                    {suggestionResult.activities?.practise}
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.65rem',
                    background: 'var(--bg-teal-subtle)',
                    border: '1px solid var(--teal-border)',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--teal-text)' }}>
                    Advance ({advanceCount})
                  </div>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.15rem' }}>
                    {suggestionResult.activities?.advance}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                  Suggested Classroom Interventions:
                </div>
                <ul
                  style={{
                    paddingLeft: '1.1rem',
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  {(suggestionResult.interventionPlan || []).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Follow-Up Questions */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Layers size={17} color="#0d9488" />
                Follow-Up Questions
              </h2>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleBuildFollowUpCheckpoint}
              >
                <FilePlus2 size={14} />
                Use as New Assessment
              </button>
            </div>

            <div className="grid-3">
              {(suggestionResult.followUpQuestions || []).map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.85rem',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.4rem'
                      }}
                    >
                      <span className="badge badge-navy">Q{idx + 1}</span>
                      <span className="badge badge-slate">{q.conceptTag}</span>
                    </div>
                    <div
                      style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.55rem' }}
                    >
                      {q.text}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      fontSize: '0.78rem'
                    }}
                  >
                    {q.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isCorrect = oIdx === q.correctOptionIndex;
                      return (
                        <div
                          key={oIdx}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            background: isCorrect ? '#dcfce7' : '#ffffff',
                            border: `1px solid ${
                              isCorrect ? '#86efac' : 'var(--border-color)'
                            }`,
                            fontWeight: isCorrect ? 700 : 400,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>
                            {letter}. {opt}
                          </span>
                          {isCorrect && <CheckCircle2 size={12} color="#166534" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
