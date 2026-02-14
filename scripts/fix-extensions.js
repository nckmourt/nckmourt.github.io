import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '../public/images/projects');
const contentDir = path.join(__dirname, '../src/content/projects');

async function fixExtensions() {
    try {
        // 1. Rename files
        const files = await fs.readdir(imagesDir);
        for (const file of files) {
            if (file.endsWith('.php')) {
                const oldPath = path.join(imagesDir, file);
                const newPath = path.join(imagesDir, file.replace('.php', '.jpg'));
                await fs.rename(oldPath, newPath);
                console.log(`Renamed: ${file} -> ${path.basename(newPath)}`);
            }
        }

        // 2. Update references in MD files
        const contentFiles = await fs.readdir(contentDir);
        for (const file of contentFiles) {
            if (file.endsWith('.md')) {
                const filePath = path.join(contentDir, file);
                let content = await fs.readFile(filePath, 'utf-8');

                if (content.includes('.php')) {
                    content = content.replace(/\.php/g, '.jpg');
                    await fs.writeFile(filePath, content);
                    console.log(`Updated reference in: ${file}`);
                }
            }
        }

        console.log("All extensions fixed.");
    } catch (error) {
        console.error("Error fixing extensions:", error);
    }
}

fixExtensions();
