import { processArticle } from './add-article.js';

const urls = [
    "https://wapo.st/4lK1zjz",
    "https://wapo.st/3WjjAKt",
    "https://wapo.st/3XAaHMz",
    "https://wapo.st/3OssBQh",
    "https://wapo.st/4lRmktN",
    "https://wapo.st/45Umavr",
    "https://wapo.st/3XlJcaq",
    "https://wapo.st/3Tg1VRw",
    "https://wapo.st/485aGHm",
    "https://wapo.st/3Zon0Ox",
    "https://wapo.st/4qKoSMO",
    "https://wapo.st/4mpmngC",
    "https://wapo.st/4gPqS0g",
    "https://wapo.st/4qKoSMO",
    "https://wapo.st/4bGpiPj",
    "https://wapo.st/4iPwsl4",
    "https://wapo.st/4qpxmYa",
    "https://wapo.st/48OlcTt",
    "https://wapo.st/3M0JS22",
    "https://wapo.st/3SNDX0b",
    "https://wapo.st/4nMYoHO",
    "https://wapo.st/43NoQZB",
    "https://wapo.st/4gJLvea",
    "https://wapo.st/45Z8vDj",
    "https://wapo.st/40dJ0M6",
    "https://wapo.st/4lzy8Rf",
    "https://wapo.st/3yp6bYj",
    "https://wapo.st/48AYWuB",
    "https://wapo.st/400eTGW",
    "https://wapo.st/4ikb7jY",
    "https://wapo.st/4rKh2Tg",
    "https://wapo.st/4rKh2Tg",
    "https://wapo.st/4cimOGU",
    "https://wapo.st/4cir3SU",
    "https://wapo.st/3O1udk5",
    "https://wapo.st/4chpfJN",
    "https://wapo.st/3IeODCZ"
];

// Process in chunks to avoid overwhelming fetches if necessary, but 37 is fine sequentially
async function runBatch() {
    // Remove duplicates
    const uniqueUrls = [...new Set(urls)];
    console.log(`Processing ${uniqueUrls.length} unique URLs...`);

    for (const url of uniqueUrls) {
        await processArticle(url);
        // small delay to be polite
        await new Promise(r => setTimeout(r, 500));
    }
}

runBatch();
