import { WebsiteAudit, ImpactLevel, EffortLevel, CanonicalTag } from "../types";

/**
 * In a browser-only environment, we cannot strictly crawl due to CORS.
 * This service simulates the crawler behavior, returning realistic data structures
 * that would typically come from a Python/Node.js backend (e.g., Puppeteer/Playwright).
 */

const SIMULATION_DELAY_MS = 3000;

export const crawlWebsite = async (url: string): Promise<WebsiteAudit> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockAudit(url));
    }, SIMULATION_DELAY_MS);
  });
};

const generateMockAudit = (url: string): WebsiteAudit => {
  // Deterministic "random" based on URL length to make it feel persistent
  const seed = url.length;
  const isSecure = url.startsWith('https');
  
  const lcp = 1.2 + (seed % 3); // 1.2 to 4.2
  const performanceScore = Math.max(10, 100 - (lcp * 10));

  // Canonical Logic
  // Simulate different states based on URL length to show functionality
  const hasCanonicalIssue = seed % 6 === 0; // Simulate missing canonical
  const hasDuplicateCanonical = seed % 8 === 0; // Simulate duplicate canonical
  
  let canonical: CanonicalTag;

  if (hasDuplicateCanonical) {
    canonical = {
      present: true,
      url: url,
      count: 2,
      score: 0,
      issues: ['Multiple canonical tags found on page', 'Duplicate tags confuse search engines']
    };
  } else if (hasCanonicalIssue) {
    canonical = {
      present: false,
      url: undefined,
      count: 0,
      score: 0,
      issues: ['Missing canonical tag', 'Risk of duplicate content penalties']
    };
  } else {
    canonical = {
      present: true,
      url: url,
      count: 1,
      score: 100,
      issues: []
    };
  }

  return {
    id: crypto.randomUUID(),
    websiteUrl: url,
    auditDate: new Date().toISOString(),
    
    technical: {
      ssl: { 
        valid: isSecure, 
        score: isSecure ? 100 : 0, 
        issues: isSecure ? [] : ['SSL Certificate missing or invalid'] 
      },
      canonical,
      pageSpeed: {
        desktop: performanceScore,
        mobile: performanceScore - 15,
        cwv: {
          lcp: parseFloat(lcp.toFixed(2)),
          fid: 20 + (seed * 2),
          cls: 0.05
        },
        score: performanceScore
      },
      mobileResponsive: {
        valid: true,
        score: 90,
        issues: []
      },
      sitemap: {
        present: true,
        valid: true,
        url: `${url}/sitemap.xml`,
        score: 100
      },
      schema: {
        types: ['Organization', 'WebSite'],
        valid: true,
        errors: [],
        score: 85
      },
      metaTags: {
        title: {
          content: "Home | " + extractDomain(url),
          length: 25,
          hasKeyword: true,
          score: 60,
          recommendations: ["Title is too short (recommended 50-60 chars)"]
        },
        description: {
          content: "Welcome to our website. We offer services.",
          length: 45,
          hasKeyword: false,
          hasCTA: false,
          score: 40,
          recommendations: ["Description too short", "Missing CTA"]
        }
      }
    },

    onPage: {
      headers: {
        h1Count: 1,
        structure: [
          { tag: 'h1', content: 'Main Heading' },
          { tag: 'h2', content: 'Sub Heading 1' },
          { tag: 'h2', content: 'Sub Heading 2' }
        ],
        score: 95
      },
      internalLinks: { count: 12, broken: 0, score: 100 },
      images: { total: 8, missingAlt: 2, optimized: 6, score: 80 },
      wordCount: 850
    },

    aiAnalysis: {
      // Populated by Gemini Service later
    },

    scores: {
      overall: Math.floor((performanceScore + 80 + 70 + canonical.score) / 4), // Include canonical in calc
      technical: Math.floor((performanceScore + canonical.score) / 2),
      onPage: 80,
      content: 70
    }
  };
};

const extractDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};