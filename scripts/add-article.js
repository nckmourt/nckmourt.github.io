import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

// Helper to get __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fetchUrl(res.headers.location).then(resolve).catch(reject);
                return;
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function downloadImageHttps(url, localPath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                downloadImageHttps(res.headers.location, localPath).then(resolve).catch(reject);
                return;
            }
            const file = fs.open(localPath, 'w').then(fileHandle => {
                const stream = fileHandle.createWriteStream();
                res.pipe(stream);
                stream.on('finish', () => {
                    stream.close();
                    resolve();
                });
            });
        }).on('error', reject);
    });
}

// Native fetch in Node 20 is available, but let's use a robust helper matching the environment
// Actually, Node 18+ has global fetch. use that for simplicity if environment supports it.
// user has node 20.

export async function processArticle(targetUrl) {
    try {
        console.log(`Processing: ${targetUrl}`);
        const res = await fetch(targetUrl);

        if (!res.ok) {
            console.error(`Failed to fetch ${targetUrl}: ${res.status}`);
            return;
        }

        const html = await res.text();

        // Regex extraction
        const getMeta = (prop) => {
            const regex = new RegExp(`<meta (?:property|name)="${prop}" content="([^"]*)"`, 'i');
            const match = html.match(regex);
            return match ? match[1] : null;
        };

        let title = getMeta('og:title') || getMeta('twitter:title') || 'Untitled';
        // Clean title (remove " - The Washington Post" etc if needed, though usually OG title is good)
        const description = getMeta('og:description') || getMeta('description') || '';
        const image = getMeta('og:image') || getMeta('twitter:image');
        let date = getMeta('article:published_time');

        // Fallback date to today if missing
        if (!date) {
            // Try to find json-ld date
            const jsonLdMatch = html.match(/"datePublished":"([^"]*)"/);
            if (jsonLdMatch) date = jsonLdMatch[1];
        }

        if (!date) date = new Date().toISOString();

        try {
            date = new Date(date).toISOString().split('T')[0];
        } catch (e) {
            date = new Date().toISOString().split('T')[0];
        }

        // Slug generation
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
            .substring(0, 50); // Limit slug length

        // Download image
        let imagePath = '';
        if (image) {
            const ext = path.extname(image.split('?')[0]) || '.jpg';
            const filename = `${slug}${ext}`;
            const relativePath = `/images/projects/${filename}`;
            const localPath = path.join(__dirname, '../public/images/projects', filename);

            await fs.mkdir(path.dirname(localPath), { recursive: true });

            const imgRes = await fetch(image);
            if (imgRes.ok) {
                const buffer = Buffer.from(await imgRes.arrayBuffer());
                await fs.writeFile(localPath, buffer);
                imagePath = relativePath;
                console.log(`  Saved image: ${filename}`);
            } else {
                console.error(`  Failed to download image: ${image}`);
            }
        }

        const content = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
date: "${date}"
role: "Graphics Reporter"
featured: false
externalUrl: "${targetUrl}"
heroImage: "${imagePath}"
---
`;

        const filePath = path.join(__dirname, `../src/content/projects/${slug}.md`);
        await fs.writeFile(filePath, content);
        console.log(`  Created: ${slug}.md`);

    } catch (error) {
        console.error(`Error processing ${targetUrl}:`, error);
    }
}
