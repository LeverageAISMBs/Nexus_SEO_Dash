
import { WebsiteAudit, ImpactLevel, EffortLevel, CanonicalTag, MetaTag } from "../types";

/**
 * PHASE 1 ARCHITECTURE:
 * The Browser calls the local Node.js BFF (Backend for Frontend) to bypass CORS.
 * The BFF fetches the HTML and returns raw metadata.
 * This service calculates the scores and formats the final Audit object.
 * 
 * Fallback: If the BFF is offline, it reverts to the simulation engine.
 */

const API_ENDPOINT = 'http://localhost:3001/api/crawl';
const SIMULATION_DELAY_MS = 2000;

export const crawlWebsite = async (url: string): Promise<WebsiteAudit> => {
  try {
    // 1. Attempt to fetch real data from the BFF
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`BFF Connection Failed: ${response.statusText}`);
    }

    const result = await response.json();
    return processRealData(url, result.data);

  } catch (error) {
    console.warn("Nexus Crawler: BFF offline or unreachable. Switching to Simulation Mode.", error);
    // 2. Fallback to Simulation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockAudit(url));
      }, SIMULATION_DELAY_MS);
    });
  }
};

const analyzeMetaDescription = (content: string, domainKeyword: string): MetaTag => {
  let score = 100;
  const recommendations: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // 1. Length Check (Weight: 40 points)
  if (content.length === 0) {
    score = 0;
    recommendations.push("Meta description is missing.");
    return { content, length: 0, score, recommendations, hasKeyword: false, hasCTA: false };
  } else if (content.length < 120) {
    score -= 20;
    recommendations.push(`Description is too short (${content.length} chars). Aim for 150-160 characters.`);
  } else if (content.length > 165) {
    score -= 10;
    recommendations.push(`Description is too long (${content.length} chars). Truncation may occur in SERPs.`);
  }

  // 2. Keyword Presence (Weight: 30 points)
  const hasKeyword = lowerContent.includes(domainKeyword.toLowerCase());
  if (!hasKeyword && domainKeyword.length > 0) {
    score -= 30;
    recommendations.push(`Primary keyword "${domainKeyword}" is missing from the description.`);
  }

  // 3. CTA Presence (Weight: 30 points)
  const ctaWords = ['call', 'shop', 'buy', 'learn', 'discover', 'get', 'sign', 'contact', 'try', 'join', 'click', 'read'];
  const hasCTA = ctaWords.some(word => lowerContent.includes(word));
  if (!hasCTA) {
    score -= 30;
    recommendations.push("No Call-to-Action detected (e.g., 'Learn more', 'Sign up', 'Discover').");
  }

  return {
    content,
    length: content.length,
    hasKeyword,
    hasCTA,
    score: Math.max(0, score),
    recommendations
  };
};

const extractDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

/**
 * Process raw data from the server into a WebsiteAudit object
 */
const processRealData = (url: string, data: any): WebsiteAudit => {
  const domain = extractDomain(url);
  const domainKeyword = domain.split('.')[0];
  const isSecure = url.startsWith('https');

  // Analyze Meta Description using the shared logic
  const metaDescriptionAnalysis = analyzeMetaDescription(data.description || '', domainKeyword);

  // Analyze Title
  const titleScore = data.title.length >= 30 && data.title.length <= 60 ? 100 : 50;
  const titleRecs = [];
  if (data.title.length < 30) titleRecs.push("Title is too short (recommended 30-60 chars)");
  if (data.title.length > 60) titleRecs.push("Title is too long (recommended 30-60 chars)");

  // Phase 1 Simulation for Core Web Vitals (Requires Phase 2 Headless Browser for real data)
  // We mix real content data with simulated performance metrics
  const seed = url.length;
  const lcp = 1.2 + (seed % 3); 
  const performanceScore = Math.max(10, 100 - (lcp * 10));

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
      canonical: {
        present: true, // simplified for Phase 1
        url: url,
        count: 1,
        score: 100,
        issues: []
      },
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
      mobileResponsive: { valid: true, score: 90, issues: [] },
      sitemap: { present: true, valid: true, url: `${url}/sitemap.xml`, score: 100 },
      schema: { types: ['Organization'], valid: true, errors: [], score: 85 },
      metaTags: {
        title: {
          content: data.title,
          length: data.title.length,
          hasKeyword: data.title.toLowerCase().includes(domainKeyword),
          score: titleScore,
          recommendations: titleRecs
        },
        description: metaDescriptionAnalysis
      }
    },

    onPage: {
      headers: {
        h1Count: data.h1s.length,
        structure: data.h1s.map((h1: string) => ({ tag: 'h1', content: h1 })),
        score: data.h1s.length === 1 ? 100 : 50
      },
      internalLinks: { count: data.linkCount, broken: 0, score: 90 },
      images: { total: data.imgCount, missingAlt: 0, optimized: 0, score: 80 },
      wordCount: data.wordCount
    },

    aiAnalysis: {}, // Populated later

    scores: {
      overall: Math.floor((performanceScore + 80 + 80 + metaDescriptionAnalysis.score) / 4),
      technical: Math.floor((performanceScore + 100 + metaDescriptionAnalysis.score) / 3),
      onPage: 80,
      content: 70
    }
  };
};

// --- SIMULATION FALLBACK (Existing Code) ---

const generateMockAudit = (url: string): WebsiteAudit => {
  // Deterministic "random" based on URL length to make it feel persistent
  const seed = url.length;
  const isSecure = url.startsWith('https');
  const domain = extractDomain(url);
  const domainKeyword = domain.split('.')[0];
  
  const lcp = 1.2 + (seed % 3); // 1.2 to 4.2
  const performanceScore = Math.max(10, 100 - (lcp * 10));

  // Canonical Logic
  const hasCanonicalIssue = seed % 6 === 0;
  const hasDuplicateCanonical = seed % 8 === 0;
  
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

  // Meta Description Simulation based on seed to vary results
  let metaDescContent = "";
  if (seed % 3 === 0) {
    // Optimal
    metaDescContent = `Discover the best ${domainKeyword} solutions for your business. Join thousands of satisfied customers and sign up today for a free trial to boost your efficiency.`;
  } else if (seed % 3 === 1) {
    // Short, no keyword
    metaDescContent = "We provide great services for everyone.";
  } else {
    // Long, no CTA, has keyword
    metaDescContent = `Welcome to the official ${domainKeyword} website where we talk about ${domainKeyword} related things. It is very important to understand that our company has been around for a long time and we really care about quality but sometimes we write too much without getting to the point.`;
  }

  const metaDescriptionAnalysis = analyzeMetaDescription(metaDescContent, domainKeyword);

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
          content: "Home | " + domain,
          length: 25,
          hasKeyword: true,
          score: 60,
          recommendations: ["Title is too short (recommended 50-60 chars)"]
        },
        description: metaDescriptionAnalysis
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
      overall: Math.floor((performanceScore + 80 + 70 + canonical.score + metaDescriptionAnalysis.score) / 5),
      technical: Math.floor((performanceScore + canonical.score + metaDescriptionAnalysis.score) / 3),
      onPage: 80,
      content: 70
    }
  };
};
    