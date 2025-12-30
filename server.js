
const express = require('express');
const cors = require('cors');
const { URL } = require('url');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to extract basic SEO data from HTML string
// In Phase 2, this will be replaced by Puppeteer/Playwright
const parseHtml = (html) => {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || 
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  
  // Extract H1s
  const h1Matches = [...html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi)].map(m => m[1].trim());
  
  // Extract Links count (rough estimate)
  const linkCount = (html.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || []).length;
  
  // Extract Images count
  const imgCount = (html.match(/<img[^>]*>/gi) || []).length;

  // Simple Word Count (strip tags and count)
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').length;

  return {
    title: titleMatch ? titleMatch[1].trim() : '',
    description: descMatch ? descMatch[1].trim() : '',
    h1s: h1Matches,
    linkCount,
    imgCount,
    wordCount
  };
};

app.post('/api/crawl', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`[Crawler] Fetching: ${url}`);
    
    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Nexus-SEO-Crawler/1.0'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch page: ${response.statusText}` });
    }

    const html = await response.text();
    const extractedData = parseHtml(html);

    // Return the raw data. The frontend service will calculate scores.
    res.json({
      success: true,
      url,
      statusCode: response.status,
      data: extractedData
    });

  } catch (error) {
    console.error('[Crawler] Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Nexus SEO Command Center - BFF Service`);
  console.log(`STATUS: Online`);
  console.log(`PORT:   ${PORT}`);
  console.log(`MODE:   Phase 1 (Fetch & Parse)`);
  console.log(`\nWaiting for requests...`);
});
    