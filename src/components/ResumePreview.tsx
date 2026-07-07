import React from 'react';
import { ResumeData } from '../services/gemini';
import { Printer } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
  title?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume, title = "Resume Preview" }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="resume-preview-container no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 600, fontSize: '1.25rem' }}>{title}</h3>
        <button onClick={handlePrint} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <Printer size={16} />
          Print / PDF Export
        </button>
      </div>
      
      {/* Resume Content paper sheet */}
      <div className="resume-paper">
        {/* Contact info */}
        <div className="resume-header-section">
          <h1 className="resume-name">{resume.contact.fullName || 'Your Name'}</h1>
          <div className="resume-contact-info">
            {resume.contact.email && <span>{resume.contact.email}</span>}
            {resume.contact.phone && <span>{resume.contact.phone}</span>}
            {resume.contact.location && <span>{resume.contact.location}</span>}
            {resume.contact.website && <span>{resume.contact.website}</span>}
          </div>
        </div>

        {/* Summary */}
        {resume.summary && (
          <div className="resume-section">
            <h2 className="resume-section-title">Professional Summary</h2>
            <p style={{ fontSize: '9.5pt', color: '#1f2937', textAlign: 'justify' }}>{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title">Professional Experience</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="resume-item">
                <div className="resume-item-header">
                  <span>{exp.company}</span>
                  <span>{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="resume-item-subheader">
                  <span>{exp.role}</span>
                </div>
                {exp.description && (
                  <ul className="resume-bullets">
                    {exp.description.split('\n').filter(bullet => bullet.trim()).map((bullet, idx) => (
                      <li key={idx}>{bullet.replace(/^[•\-\*\s]+/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title">Projects</h2>
            {resume.projects.map((proj) => (
              <div key={proj.id} className="resume-item">
                <div className="resume-item-header">
                  <span>{proj.name}</span>
                  {proj.technologies && <span style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '9.5pt', color: '#4b5563' }}>{proj.technologies}</span>}
                </div>
                <p style={{ fontSize: '9.5pt', color: '#1f2937', marginTop: '0.25rem' }}>{proj.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title">Education</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="resume-item">
                <div className="resume-item-header">
                  <span>{edu.school}</span>
                  <span>{edu.gradDate}</span>
                </div>
                <div className="resume-item-subheader">
                  <span>{edu.degree} in {edu.major}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title">Skills & Technical Expertise</h2>
            <div className="resume-skills-grid" style={{ flexDirection: 'column', gap: '0.25rem' }}>
              {resume.skills.map((skill, idx) => (
                <div key={idx} className="resume-skills-item">
                  <span className="resume-skills-category">{skill.category}: </span>
                  <span>{skill.items}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
