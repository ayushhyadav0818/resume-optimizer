import { useState } from 'react';
import { ResumeData } from './services/gemini';
import { ResumeForm } from './components/ResumeForm';
import { OptimizerWorkspace } from './components/OptimizerWorkspace';
import { ResumePreview } from './components/ResumePreview';
import { Sparkles, FileEdit, ClipboardList, Key, Moon, Sun } from 'lucide-react';

const DEFAULT_RESUME: ResumeData = {
  contact: {
    fullName: "Alex Rivera",
    email: "alex.rivera@email.com",
    phone: "+1 (555) 123-4567",
    location: "Austin, TX",
    website: "github.com/alexrivera"
  },
  summary: "Results-driven Software Engineer with 3+ years of experience designing, building, and deploying scalable web applications. Passionate about writing clean, maintainable code and solving complex algorithm problems.",
  experience: [
    {
      id: "exp-1",
      company: "CloudScale Tech",
      role: "Software Engineer",
      startDate: "Jun 2023",
      endDate: "Present",
      description: "• Built and deployed front-end features using React, TypeScript, and Tailwind CSS.\n• Reduced page load times by 35% through image optimizations and code-splitting.\n• Developed backend RESTful APIs using Node.js, Express, and PostgreSQL."
    },
    {
      id: "exp-2",
      company: "InnoSoft Solutions",
      role: "Associate Developer",
      startDate: "Jan 2021",
      endDate: "May 2023",
      description: "• Assisted in migrating a legacy monolithic system to a microservices architecture.\n• Wrote unit and integration tests using Jest and React Testing Library.\n• Participated in daily standups and sprint planning sessions under Agile methodology."
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "University of Texas at Austin",
      degree: "Bachelor of Science",
      major: "Computer Science",
      gradDate: "Dec 2020"
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "E-Commerce Microservices Platform",
      technologies: "React, Node.js, Docker, Kubernetes, AWS",
      description: "Designed and implemented a scalable microservices architecture. Set up a CI/CD pipeline using GitHub Actions to deploy containers to AWS ECS."
    }
  ],
  skills: [
    { category: "Languages", items: "JavaScript, TypeScript, Python, HTML/CSS, SQL" },
    { category: "Frameworks & Libraries", items: "React, Node.js, Express, Next.js" },
    { category: "Tools & Cloud", items: "Git, Docker, AWS (S3, EC2), PostgreSQL, MongoDB" }
  ]
};

type AppTab = 'base-edit' | 'base-preview' | 'optimize';

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [baseResume, setBaseResume] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('resume_base_profile');
    return saved ? JSON.parse(saved) : DEFAULT_RESUME;
  });
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('base-edit');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Sync state to local storage
  const handleSaveBaseResume = (data: ResumeData) => {
    setBaseResume(data);
    localStorage.setItem('resume_base_profile', JSON.stringify(data));
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowKeyInput(false);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header no-print">
        <div className="logo">
          <div className="logo-icon">✨</div>
          <span>ResumeAI Optimizer</span>
        </div>

        {/* Tab Selection */}
        <div className="nav-tabs">
          <button
            onClick={() => setActiveTab('base-edit')}
            className={`tab-btn ${activeTab === 'base-edit' ? 'active' : ''}`}
          >
            <FileEdit size={16} />
            Edit Base Profile
          </button>
          <button
            onClick={() => setActiveTab('base-preview')}
            className={`tab-btn ${activeTab === 'base-preview' ? 'active' : ''}`}
          >
            <ClipboardList size={16} />
            Preview Base
          </button>
          <button
            onClick={() => setActiveTab('optimize')}
            className={`tab-btn ${activeTab === 'optimize' ? 'active' : ''}`}
          >
            <Sparkles size={16} />
            Job Optimizer
          </button>
        </div>

        {/* Actions */}
        <div className="header-actions">
          <button onClick={() => setShowKeyInput(!showKeyInput)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <Key size={16} />
            {apiKey ? 'API Key Saved' : 'Configure API Key'}
          </button>
          <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* API Key Modal Banner */}
      {showKeyInput && (
        <div className="no-print" style={{ padding: '0.75rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong>Enter Gemini API Key:</strong> Your key is stored locally in your browser's localStorage and never sent anywhere else.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', width: '350px' }}>
              <input
                type="password"
                className="form-input"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                style={{ padding: '0.4rem 0.8rem' }}
              />
              {apiKey && (
                <button
                  onClick={() => handleSaveApiKey('')}
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Clear Key
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="main-content">
        {activeTab === 'base-edit' && (
          <ResumeForm initialData={baseResume} onSave={handleSaveBaseResume} />
        )}

        {activeTab === 'base-preview' && (
          <ResumePreview resume={baseResume} title="Base Master Resume" />
        )}

        {activeTab === 'optimize' && (
          <OptimizerWorkspace
            baseResume={baseResume}
            apiKey={apiKey}
            onOptimizedSaved={setOptimizedResume}
          />
        )}
      </main>

      {/* Background print layout block (only visible during system print) */}
      <div className="print-only-container" style={{ display: 'none' }}>
        <ResumePreview resume={optimizedResume || baseResume} />
      </div>
    </div>
  );
}
