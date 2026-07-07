export interface ResumeData {
  contact: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  summary: string;
  experience: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string; // newlines for bullet points
  }[];
  education: {
    id: string;
    school: string;
    degree: string;
    major: string;
    gradDate: string;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    technologies: string;
  }[];
  skills: {
    category: string;
    items: string; // comma separated
  }[];
}

export interface OptimizationResult {
  score: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  feedback: string[];
  optimizedResume: ResumeData;
}

// Client-side fallback mock optimization engine (runs when no API key provided)
export function runMockOptimization(baseResume: ResumeData, jobDescription: string): OptimizationResult {
  // Simple keyword matching for demo/fallback purposes
  const jdLower = jobDescription.toLowerCase();
  
  // Extract potential keywords from JD
  const commonTechKeywords = [
    'react', 'typescript', 'javascript', 'html', 'css', 'node', 'python', 'java', 'sql', 'nosql',
    'aws', 'docker', 'kubernetes', 'ci/cd', 'agile', 'scrum', 'testing', 'rest api', 'graphql',
    'machine learning', 'data analysis', 'project management', 'ui/ux', 'git', 'communication',
    'collaboration', 'problem solving', 'leadership', 'analytics', 'backend', 'frontend', 'fullstack'
  ];

  const jdKeywords = commonTechKeywords.filter(kw => jdLower.includes(kw));
  
  // Check resume content
  const resumeText = JSON.stringify(baseResume).toLowerCase();
  const matchingKeywords = jdKeywords.filter(kw => resumeText.includes(kw));
  const missingKeywords = jdKeywords.filter(kw => !resumeText.includes(kw));

  // Calculate a basic score
  let score = 30; // base score
  if (jdKeywords.length > 0) {
    score = Math.min(100, Math.round(30 + (matchingKeywords.length / jdKeywords.length) * 70));
  }

  // Create feedback suggestions
  const feedback = [
    `ATS Match Score is at ${score}%. To improve, try incorporating more missing keywords.`,
    missingKeywords.length > 0 
      ? `Consider adding skills like: ${missingKeywords.slice(0, 3).join(', ')} to your Skills section.`
      : 'Excellent skill coverage identified in your profile!',
    'Rewrite your experience bullet points to start with strong action verbs (e.g., Led, Developed, Architected) that match the JD.'
  ];

  // Simple rule-based mock optimizer (adds some missing skills, adjusts summary)
  const optimizedResume = JSON.parse(JSON.stringify(baseResume)) as ResumeData;
  
  // Add missing keywords to skills section
  if (missingKeywords.length > 0 && optimizedResume.skills.length > 0) {
    const mainCategory = optimizedResume.skills[0];
    const originalItems = mainCategory.items.split(',').map(s => s.trim());
    const newItems = [...new Set([...originalItems, ...missingKeywords.slice(0, 3)])];
    mainCategory.items = newItems.join(', ');
  }

  // Rewrite summary to include top matching/missing keywords
  if (missingKeywords.length > 0) {
    optimizedResume.summary = `${baseResume.summary || 'Detail-oriented professional'} leveraging expertise in ${matchingKeywords.slice(0, 2).join(', ') || 'software engineering'}, seeking to drive success using skills in ${missingKeywords.slice(0, 2).join(', ')}.`;
  }

  return {
    score,
    matchingKeywords,
    missingKeywords,
    feedback,
    optimizedResume
  };
}

export async function optimizeResumeWithGemini(
  apiKey: string,
  baseResume: ResumeData,
  jobDescription: string
): Promise<OptimizationResult> {
  if (!apiKey) {
    return runMockOptimization(baseResume, jobDescription);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are an expert ATS (Applicant Tracking System) optimization assistant and professional resume writer.
Your job is to optimize a candidate's base resume details to perfectly align with a target Job Description (JD).

Here is the candidate's Base Resume JSON:
${JSON.stringify(baseResume, null, 2)}

Here is the target Job Description (JD):
${jobDescription}

Perform the following:
1. Conduct an ATS match score analysis (0-100%).
2. Identify keywords from the JD that are matched in the resume, and keywords from the JD that are missing but relevant.
3. Rewrite the resume sections (especially the summary, project descriptions, and experience bullets) to seamlessly incorporate those keywords.
4. Ensure the output resume is completely accurate to the candidate's experience, but framed with terms, goals, and technical phrases matching the JD.
5. All rewritten bullets MUST start with strong action verbs.
6. The structure of the returned resume MUST strictly match the input JSON format.

Return ONLY a valid JSON object matching the following TypeScript interface:
interface OptimizationResult {
  score: number; // 0 to 100
  matchingKeywords: string[]; // List of matching keywords found
  missingKeywords: string[]; // List of keywords present in JD but missing/weak in resume
  feedback: string[]; // Practical feedback comments
  optimizedResume: ResumeData; // The fully rewritten/optimized resume data structure
}

Do not wrap the JSON in markdown code blocks like \`\`\`json. Return only the raw JSON.
`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned error status: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("Empty response received from Gemini API");
    }

    // Clean up in case Gemini added markdown code blocks anyway
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```$/, '');
    }

    const result = JSON.parse(cleanJson) as OptimizationResult;
    
    // Validate output structure has optimizedResume
    if (!result.optimizedResume || !result.optimizedResume.contact) {
      throw new Error("Invalid output structure received from Gemini API");
    }
    
    return result;
  } catch (error) {
    console.error("Gemini optimization error:", error);
    // Fallback to mock on network error
    const fallback = runMockOptimization(baseResume, jobDescription);
    fallback.feedback.unshift(`Note: LLM call failed (${error instanceof Error ? error.message : String(error)}). Using local rule-based simulation engine.`);
    return fallback;
  }
}
