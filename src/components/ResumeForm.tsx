import React, { useState } from 'react';
import { ResumeData } from '../services/gemini';
import { Plus, Trash, Save, Upload, FileJson } from 'lucide-react';

interface ResumeFormProps {
  initialData: ResumeData;
  onSave: (data: ResumeData) => void;
}

type FormTab = 'contact' | 'summary' | 'experience' | 'projects' | 'education' | 'skills';

export const ResumeForm: React.FC<ResumeFormProps> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState<ResumeData>(initialData);
  const [activeTab, setActiveTab] = useState<FormTab>('contact');

  const updateContact = (field: keyof ResumeData['contact'], value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const updateSummary = (value: string) => {
    setFormData(prev => ({
      ...prev,
      summary: value
    }));
  };

  // Generic lists helpers
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', description: '' }
      ]
    }));
  };

  const removeExperience = (id: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const updateExperience = (id: string, field: keyof ResumeData['experience'][0], value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { id: Date.now().toString(), school: '', degree: '', major: '', gradDate: '' }
      ]
    }));
  };

  const removeEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const updateEducation = (id: string, field: keyof ResumeData['education'][0], value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { id: Date.now().toString(), name: '', description: '', technologies: '' }
      ]
    }));
  };

  const removeProject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const updateProject = (id: string, field: keyof ResumeData['projects'][0], value: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj)
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { category: '', items: '' }]
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== index)
    }));
  };

  const updateSkill = (index: number, field: keyof ResumeData['skills'][0], value: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((sk, idx) => idx === index ? { ...sk, [field]: value } : sk)
    }));
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${formData.contact.fullName.replace(/\s+/g, '_')}_resume_base.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as ResumeData;
        if (parsed.contact && parsed.skills) {
          setFormData(parsed);
          onSave(parsed);
          alert("Resume profile loaded successfully!");
        } else {
          alert("Invalid resume JSON structure");
        }
      } catch (err) {
        alert("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveAndNotify = () => {
    onSave(formData);
  };

  // Tab navigation items
  const tabs: { id: FormTab; label: string }[] = [
    { id: 'contact', label: 'Contact Details' },
    { id: 'summary', label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
  ];

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '1.5rem' }}>Edit Base Resume</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fill in your foundational experience. We will use this to optimize for specific jobs.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            Import Profile
            <input type="file" accept=".json" onChange={handleImportJson} style={{ display: 'none' }} />
          </label>
          <button onClick={handleExportJson} className="btn btn-secondary">
            <FileJson size={16} />
            Export Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="wizard-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`wizard-step ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
        {activeTab === 'contact' && (
          <div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={formData.contact.fullName}
                onChange={(e) => updateContact('fullName', e.target.value)}
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="john.doe@example.com"
                  value={formData.contact.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.contact.phone}
                  onChange={(e) => updateContact('phone', e.target.value)}
                />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Location (City, State/Country)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="San Francisco, CA"
                  value={formData.contact.location}
                  onChange={(e) => updateContact('location', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Website / LinkedIn / GitHub</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="linkedin.com/in/johndoe"
                  value={formData.contact.website}
                  onChange={(e) => updateContact('website', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="form-group">
            <label className="form-label">Professional Summary</label>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Write a short professional intro. The optimizer will tailor this based on the JD.</p>
            <textarea
              className="form-textarea"
              placeholder="Experienced Software Engineer with a track record of..."
              value={formData.summary}
              onChange={(e) => updateSummary(e.target.value)}
              style={{ minHeight: '180px' }}
            />
          </div>
        )}

        {activeTab === 'experience' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Work Experience</h3>
              <button onClick={addExperience} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> Add Position
              </button>
            </div>
            {formData.experience.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No experience listed yet. Click "Add Position" to begin.</p>
            )}
            {formData.experience.map((exp, index) => (
              <div key={exp.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', background: 'rgba(255, 255, 255, 0.01)' }}>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="btn btn-danger"
                  style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem' }}
                  title="Remove Position"
                >
                  <Trash size={16} />
                </button>
                <h4 style={{ color: 'var(--accent-purple)', fontWeight: 600, marginBottom: '1rem' }}>Position #{index + 1}</h4>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Title / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Jan 2022"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Present"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Role Description (One bullet per line)</label>
                  <textarea
                    className="form-textarea"
                    placeholder="• Developed user interfaces using React and Redux&#10;• Collaborated with UX designers to improve conversion rate"
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Personal / Professional Projects</h3>
              <button onClick={addProject} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> Add Project
              </button>
            </div>
            {formData.projects.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No projects listed yet.</p>
            )}
            {formData.projects.map((proj, index) => (
              <div key={proj.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', background: 'rgba(255, 255, 255, 0.01)' }}>
                <button
                  onClick={() => removeProject(proj.id)}
                  className="btn btn-danger"
                  style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem' }}
                >
                  <Trash size={16} />
                </button>
                <h4 style={{ color: 'var(--accent-purple)', fontWeight: 600, marginBottom: '1rem' }}>Project #{index + 1}</h4>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Project Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={proj.name}
                      onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Technologies Used</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. React, Node.js, AWS"
                      value={proj.technologies}
                      onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Short description of your contribution, accomplishments, and tech details."
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'education' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Education</h3>
              <button onClick={addEducation} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> Add Education
              </button>
            </div>
            {formData.education.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No education listed yet.</p>
            )}
            {formData.education.map((edu, index) => (
              <div key={edu.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', background: 'rgba(255, 255, 255, 0.01)' }}>
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="btn btn-danger"
                  style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem' }}
                >
                  <Trash size={16} />
                </button>
                <h4 style={{ color: 'var(--accent-purple)', fontWeight: 600, marginBottom: '1rem' }}>Education #{index + 1}</h4>
                <div className="form-group">
                  <label className="form-label">School / University</label>
                  <input
                    type="text"
                    className="form-input"
                    value={edu.school}
                    onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                  />
                </div>
                <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Degree (e.g., B.S.)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Major / Field</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.major}
                      onChange={(e) => updateEducation(edu.id, 'major', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Graduation Date</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. May 2021"
                      value={edu.gradDate}
                      onChange={(e) => updateEducation(edu.id, 'gradDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Skills Categories</h3>
              <button onClick={addSkill} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> Add Category
              </button>
            </div>
            {formData.skills.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No skills listed yet.</p>
            )}
            {formData.skills.map((skill, index) => (
              <div key={index} className="grid-2" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', position: 'relative', background: 'rgba(255, 255, 255, 0.01)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Skill Category (e.g. Languages)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Languages, Frameworks, etc."
                    value={skill.category}
                    onChange={(e) => updateSkill(index, 'category', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0, paddingRight: '2.5rem' }}>
                  <label className="form-label">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="React, Vue, Angular"
                    value={skill.items}
                    onChange={(e) => updateSkill(index, 'items', e.target.value)}
                  />
                  <button
                    onClick={() => removeSkill(index)}
                    className="btn btn-danger"
                    style={{ position: 'absolute', right: '1rem', bottom: '1rem', padding: '0.5rem' }}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save panel */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <button
          onClick={handleSaveAndNotify}
          className="btn btn-primary"
        >
          <Save size={16} /> Save Base Profile
        </button>
      </div>
    </div>
  );
};
