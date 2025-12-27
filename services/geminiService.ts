import { GoogleGenAI, Type } from "@google/genai";
import { WebsiteAudit, Recommendation, Keyword, IndustryClassification, ImpactLevel, EffortLevel } from "../types";

// Initialize the API client
// Note: In a production app, ensure this is handled securely.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateAuditInsights = async (auditData: Partial<WebsiteAudit>): Promise<{
  industry: IndustryClassification;
  recommendations: Recommendation[];
  keywords: Keyword[];
  summary: string;
}> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock AI response.");
    return getMockAiResponse();
  }

  try {
    const prompt = `
      You are an elite SEO Strategist. Analyze the following technical audit data for ${auditData.websiteUrl}.
      
      Audit Summary:
      - Title: ${auditData.technical?.metaTags.title.content}
      - Description: ${auditData.technical?.metaTags.description.content}
      - H1 Count: ${auditData.onPage?.headers.h1Count}
      - Word Count: ${auditData.onPage?.wordCount}
      - Core Web Vitals LCP: ${auditData.technical?.pageSpeed.cwv.lcp}s
      - SSL: ${auditData.technical?.ssl.valid}

      Task:
      1. Classify the industry.
      2. Generate 3 high-impact strategic recommendations.
      3. Suggest 5 keyword opportunities (mix of long-tail).
      4. Write a 2-sentence executive summary.

      Return ONLY JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            industry: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                subCategory: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  priority: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  impact: { type: Type.STRING }, // High, Medium, Low
                  effort: { type: Type.STRING }, // High, Medium, Low
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  estimatedTime: { type: Type.STRING }
                }
              }
            },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phrase: { type: Type.STRING },
                  volume: { type: Type.NUMBER },
                  difficulty: { type: Type.STRING },
                  intent: { type: Type.STRING }
                }
              }
            },
            summary: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as {
        industry: IndustryClassification;
        recommendations: Recommendation[];
        keywords: Keyword[];
        summary: string;
      };
    }
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("AI Generation Failed:", error);
    return getMockAiResponse();
  }
};

// Fallback for demo/no-key scenarios
const getMockAiResponse = (): {
  industry: IndustryClassification;
  recommendations: Recommendation[];
  keywords: Keyword[];
  summary: string;
} => ({
  industry: {
    primary: "Technology",
    subCategory: "SaaS",
    confidence: 85,
    reasoning: "Detected technical terminology and software product schemas."
  },
  recommendations: [
    {
      id: "rec_1",
      priority: 1,
      title: "Implement Schema.org Structured Data",
      impact: ImpactLevel.HIGH,
      effort: EffortLevel.LOW,
      category: "Technical",
      description: "Enhance rich snippets by adding Organization and Product schema.",
      steps: ["Generate JSON-LD", "Inject into Head"],
      estimatedTime: "1 hour"
    },
    {
      id: "rec_2",
      priority: 2,
      title: "Optimize LCP (Largest Contentful Paint)",
      impact: ImpactLevel.HIGH,
      effort: EffortLevel.MEDIUM,
      category: "Performance",
      description: "Your LCP is 3.2s. Aim for < 2.5s by optimizing hero images.",
      steps: ["Convert to WebP", "Preload hero image"],
      estimatedTime: "3 hours"
    }
  ],
  keywords: [
    { phrase: "enterprise seo platform", volume: 1200, difficulty: "Hard", intent: "Commercial" },
    { phrase: "seo audit tools for agencies", volume: 450, difficulty: "Medium", intent: "Transactional" }
  ],
  summary: "The site has a strong technical foundation but lacks semantic depth. Performance optimizations and structured data implementation will yield the highest ROI."
});