import { WebsiteAudit, ImpactLevel, EffortLevel, CanonicalTag, MetaTag } from "../types";

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

const analyzeMetaDescription = (content: string, domainKeyword: string): MetaTag => {
  let score = 100;
  const recommendations: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // 1. Length Check (Weight: 40 points)
  // Optimal: 150-160, Acceptable: 120-165
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
  if (!hasKeyword) {
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

const extractDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};