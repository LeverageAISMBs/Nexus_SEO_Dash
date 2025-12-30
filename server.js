
const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');

// NOTE: You must run 'npm install puppeteer' for this to work
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.error('\n❌ ERROR: Puppeteer is missing.');
  console.error('👉 Please run: npm install puppeteer\n');
  process.exit(1);
}

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- JOB QUEUE ARCHITECTURE (Phase 3) ---

/**
 * JobStatus Enum
 */
const JobStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

/**
 * In-Memory Job Store
 * In a scalable production environment (Phase 4), this Map would be replaced 
 * by a Redis instance and the logic below would leverage 'bullmq'.
 */
const jobStore = new Map();

/**
 * Background Worker Logic
 * Processes jobs asynchronously.
 */
const processJob = async (jobId, url) => {
  const job = jobStore.get(jobId);
  if (!job) return;

  // Update State -> PROCESSING
  job.status = JobStatus.PROCESSING;
  job.startedAt = Date.now();
  jobStore.set(jobId, job);

  let browser = null;

  try {
    console.log(`[Worker] Starting Job ${jobId} for ${url}`);

    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 NexusSEO/1.0');

    // Optimization: Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['stylesheet', 'font', 'media'].includes(resourceType)) {
            req.abort();
        } else {
            req.continue();
        }
    });

    const response = await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 45000 // 45s timeout for heavy sites
    });

    if (!response || !response.ok()) {
      throw new Error(`Failed to load page: ${response ? response.status() : 'Unknown Error'}`);
    }

    // Extract Data
    const extractedData = await page.evaluate(() => {
      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]')?.content || 
                       document.querySelector('meta[property="og:description"]')?.content || '';
      
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim()).filter(t => t.length > 0);
      
      const images = Array.from(document.querySelectorAll('img'));
      const missingAlt = images.filter(img => !img.alt || img.alt.trim() === '').length;
      
      const links = Array.from(document.querySelectorAll('a'));
      const internalLinks = links.filter(a => a.href.includes(window.location.hostname)).length;
      
      const text = document.body.innerText || '';
      const wordCount = text.trim().split(/\s+/).length;

      const navEntry = performance.getEntriesByType('navigation')[0];
      const loadTime = navEntry ? (navEntry.loadEventEnd - navEntry.startTime) : 0;

      return {
        title,
        description: metaDesc,
        h1s,
        imgCount: images.length,
        missingAltCount: missingAlt,
        linkCount: links.length,
        internalLinkCount: internalLinks,
        wordCount,
        loadTime: Math.round(loadTime) || 0
      };
    });

    // Update State -> COMPLETED
    job.status = JobStatus.COMPLETED;
    job.completedAt = Date.now();
    job.result = extractedData;
    console.log(`[Worker] Job ${jobId} Completed in ${Date.now() - job.startedAt}ms`);

  } catch (error) {
    console.error(`[Worker] Job ${jobId} Failed:`, error.message);
    job.status = JobStatus.FAILED;
    job.error = error.message;
    job.completedAt = Date.now();
  } finally {
    if (browser) await browser.close();
    jobStore.set(jobId, job);
  }
};

// --- API ENDPOINTS ---

// 1. Submit Job
app.post('/api/jobs', (req, res) => {
  const { url } = req.body;
  
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const jobId = randomUUID();
  
  // Create Job Record
  const job = {
    id: jobId,
    url,
    status: JobStatus.PENDING,
    submittedAt: Date.now(),
    result: null,
    error: null
  };

  jobStore.set(jobId, job);

  // Trigger background processing (Fire and Forget)
  // In a real queue system, this would be `queue.add(job)`
  processJob(jobId, url);

  console.log(`[API] Job Submitted: ${jobId}`);
  res.status(202).json({ 
    success: true, 
    jobId, 
    status: JobStatus.PENDING,
    message: 'Job queued successfully'
  });
});

// 2. Poll Job Status
app.get('/api/jobs/:id', (req, res) => {
  const { id } = req.params;
  const job = jobStore.get(id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    id: job.id,
    status: job.status,
    submittedAt: job.submittedAt,
    completedAt: job.completedAt,
    result: job.result,
    error: job.error
  });
});

// Cleanup Routine (Optional: Clear old jobs every hour)
setInterval(() => {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();
  for (const [id, job] of jobStore.entries()) {
    if (job.completedAt && (now - job.completedAt > ONE_HOUR)) {
      jobStore.delete(id);
    }
  }
}, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`\n🚀 Nexus SEO Command Center - Async Job Engine`);
  console.log(`STATUS: Online`);
  console.log(`PORT:   ${PORT}`);
  console.log(`MODE:   Phase 3 (Async Queue/Polling)`);
  console.log(`\nWaiting for jobs...`);
});
