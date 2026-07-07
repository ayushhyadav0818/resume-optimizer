import React, { useState } from 'react';
import { ResumeData, optimizeResumeWithGemini, OptimizationResult } from '../services/gemini';
import { Sparkles, FileText, AlertTriangle, Cpu } from 'lucide-react';
import { ResumePreview } from './ResumePreview';

interface OptimizerWorkspaceProps {
  baseResume: ResumeData;
  apiKey: string;
  onOptimizedSaved: (optimizedData: ResumeData) => void;
}

export const OptimizerWorkspace: React.FC<OptimizerWorkspaceProps> = ({
  baseResume,
  apiKey,
  onOptimizedSaved
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'diffs' | 'feedback'>('preview');

  const handleOptimize = async () => {
    if (!jobDescription.trim()) {
      alert("Please paste a job description first.");
      return;
    }

    setLoading(true);
    try {
      const optResult = await optimizeResumeWithGemini(apiKey, baseResume, jobDescription);
      setResult(optResult);
      onOptimizedSaved(optResult.optimizedResume);
    } catch (err) {
      alert("Optimization failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Simple diff highlighting
  const renderDiff = (original: string, optimized: string) => {
    if (original === optimized) return <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{original}</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="diff-removed">
          <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-rose)' }}>Original:</strong>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{original || '(Empty)'}</p>
        </div>
        <div className="diff-added">
          <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-emerald)' }}>Optimized:</strong>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{optimized}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid-2">
      {/* Left Input Workspace */}
      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={24} className="gradient-text" />
            Optimize Workspace
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Paste the job description of your target role. We will rewrite and format your resume to pass ATS screeners.
          </p>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Job Description</label>
          <textarea
            className="form-textarea"
            placeholder="Paste the entire job posting here (roles, responsibilities, requirements, skills)..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            style={{ minHeight: '300px' }}
          />
        </div>

        {!apiKey && (
          <div className="key-banner" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>Running in Simulator Mode</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Provide a Gemini API Key in the settings at the top to enable professional AI rewriting. Under simulator mode, keywords are matched locally.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleOptimize}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', height: '50px' }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu className="scanning-pulse" size={18} />
              Scanning & Rewriting Resume...
            </div>
          ) : (
            <>
              <Sparkles size={18} />
              Optimize for Job Description
            </>
          )}
        </button>
      </div>

      {/* Right Output Workspace */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {loading && (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', minHeight: '400px' }}>
            <div className="scanning-pulse" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Cpu size={40} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem' }}>Aligning Profile with Job Requirements</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto' }}>
                Analyzing skills, mapping experience bullet points, inserting semantic keywords, and tuning professional tone...
              </p>
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', minHeight: '400px' }}>
            <FileText size={64} style={{ color: 'var(--text-muted)' }} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem' }}>Awaiting Job Description</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '350px', margin: '0.5rem auto' }}>
                Once you paste the JD and hit Optimize, the ATS scorecard and optimized resume will appear here.
              </p>
            </div>
          </div>
        )}

        {!loading && result && (
          <>
            {/* ATS Scorecard Card */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>ATS Scoring Analysis</h3>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="score-widget" style={{ borderColor: result.score >= 80 ? 'var(--accent-emerald)' : result.score >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>
                  <div className="score-value" style={{ color: result.score >= 80 ? 'var(--accent-emerald)' : result.score >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>
                    {result.score}
                  </div>
                  <div className="score-label">Match Score</div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Matching Keywords ({result.matchingKeywords.length})</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {result.matchingKeywords.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None identified</span>}
                      {result.matchingKeywords.map((kw, i) => (
                        <span key={i} className="keyword-tag keyword-match">{kw}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Missing Keywords ({result.missingKeywords.length})</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {result.missingKeywords.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None identified</span>}
                      {result.missingKeywords.map((kw, i) => (
                        <span key={i} className="keyword-tag keyword-missing">{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results workspace tabs */}
            <div className="nav-tabs" style={{ width: 'fit-content' }}>
              <button
                onClick={() => setActiveView('preview')}
                className={`tab-btn ${activeView === 'preview' ? 'active' : ''}`}
              >
                Optimized Resume
              </button>
              <button
                onClick={() => setActiveView('diffs')}
                className={`tab-btn ${activeView === 'diffs' ? 'active' : ''}`}
              >
                Compare Changes
              </button>
              <button
                onClick={() => setActiveView('feedback')}
                className={`tab-btn ${activeView === 'feedback' ? 'active' : ''}`}
              >
                Optimization Feedback
              </button>
            </div>

            {/* Tab panel displays */}
            {activeView === 'preview' && (
              <ResumePreview resume={result.optimizedResume} title="Optimized Target Resume" />
            )}

            {activeView === 'feedback' && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', marginBottom: '1rem' }}>Expert Suggestions</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem' }}>
                  {result.feedback.map((f, i) => (
                    <li key={i} style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeView === 'diffs' && (
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem' }}>Detailed Changes Analysis</h3>
                <div>
                  <h4 style={{ color: 'var(--accent-purple)', fontSize: '1rem', marginBottom: '0.5rem' }}>Summary Rewrite</h4>
                  {renderDiff(baseResume.summary, result.optimizedResume.summary)}
                </div>

                {result.optimizedResume.experience.map((optExp) => {
                  const origExp = baseResume.experience.find(e => e.id === optExp.id);
                  if (!origExp) return null;
                  return (
                    <div key={optExp.id} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                      <h4 style={{ color: 'var(--accent-purple)', fontSize: '1rem', marginBottom: '0.5rem' }}>{optExp.role} at {optExp.company}</h4>
                      {renderDiff(origExp.description, optExp.description)}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
