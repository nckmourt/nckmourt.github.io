import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const url = args[0];

if (!url) {
  console.error("Please provide a URL.");
  process.exit(1);
}

// Function to decode HTML entities (basic version for common ones)
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

async function fetchMetadata(targetUrl) {
  try {
    console.log(`Fetching ${targetUrl}...`);
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();

    // Simple regex extraction
    const getMeta = (prop) => {
      const match = html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`)) ||
        html.match(new RegExp(`<meta name="${prop}" content="([^"]*)"`));
      return match ? decodeHtmlEntities(match[1]) : null;
    };

    let title = getMeta('og:title') || getMeta('twitter:title');
    // Fallback regex for title tag
    if (!title) {
      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      if (titleMatch) title = decodeHtmlEntities(titleMatch[1]);
    }

    const description = getMeta('og:description') || getMeta('description') || '';
    const image = getMeta('og:image') || getMeta('twitter:image');
    let date = getMeta('article:published_time');

    // If no date found in meta, try to find it in JSON-LD or fallback to today
    if (!date) {
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      if (jsonLdMatch) {
        try {
          const json = JSON.parse(jsonLdMatch[1]);
          date = json.datePublished || json.dateCreated;
        } catch (e) {
          // ignore
        }
      }
    }

    // Fallback to today if still null
    date = date || new Date().toISOString();

    // Attempt to format date to YYYY-MM-DD
    try {
      date = new Date(date).toISOString().split('T')[0];
    } catch (e) {
      date = new Date().toISOString().split('T')[0];
    }

    // Clean title (remove " - The Washington Post" etc)
    if (title) {
      title = title.replace(/ - The Washington Post$/, '');
    } else {
      title = 'Untitled';
    }

    return { title, description, image, date, url: targetUrl };

  } catch (error) {
    console.error(`Error processing ${targetUrl}:`, error.message);
    return null;
  }
}

async function downloadImage(imageUrl, slug) {
  if (!imageUrl) return null;

  try {
    // Basic extension detection
    let ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    if (ext === '.') ext = '.jpg';

    const filename = `${slug}${ext}`;
    const relativePath = `/images/projects/${filename}`;
    const localPath = path.join(__dirname, '../public/images/projects', filename);

    // Ensure directory exists
    await fs.mkdir(path.dirname(localPath), { recursive: true });

    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(localPath, buffer);

    console.log(`Downloaded image to ${localPath}`);
    return relativePath;
  } catch (error) {
    console.error("Failed to download image:", error.message);
    return null; // Return null so we can still Create the project file
  }
}

async function createProjectFile(data) {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 50); // Limit slug length

  // Prevent overwrite or handle uniqueness? For now, let's just overwrite or append random if needed.
  // But standard overwriting is fine for corrections.

  const imagePath = await downloadImage(data.image, slug);

  const content = `---
title: "${data.title.replace(/"/g, '\\"')}"
description: "${data.description.replace(/"/g, '\\"')}"
date: "${data.date}"
role: "Graphics Reporter"
featured: false
externalUrl: "${data.url}"
heroImage: "${imagePath || ''}"
---
`;

  const filePath = path.join(__dirname, `../src/content/projects/${slug}.md`);
  await fs.writeFile(filePath, content);
  console.log(`Created project file: ${filePath}`);
}

// Run
const data = await fetchMetadata(url);
if (data) {
  await createProjectFile(data);
}
