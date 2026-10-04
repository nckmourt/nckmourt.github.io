import fs from 'node:fs';

// Correct GIF color tables without recompressing frames or changing timing.
const path = new URL('../public/images/projects/voting-methods.gif', import.meta.url);
const bytes = fs.readFileSync(path);
const corrections = [
  { from: [21, 85, 113], to: [21, 84, 113] }, // By mail: #155471
  { from: [222, 179, 128], to: [221, 179, 126] }, // Early voting: #DDB37E
  { from: [118, 131, 97], to: [113, 132, 93] }, // Other: #71845D
];
let offset = 13;
let changed = 0;
let palettes = 0;
function readPalette(size) {
  palettes++;
  for (let index = 0; index < size; index++, offset += 3) {
    const color = [...bytes.subarray(offset, offset + 3)];
    const correction = corrections.find(({ from, to }) =>
      [from, to].some(reference => color.every((value, channel) => Math.abs(value - reference[channel]) <= 8))
    );
    if (correction) {
      if (color.some((value, channel) => value !== correction.to[channel])) changed++;
      bytes.set(correction.to, offset);
    }
    // Neutral grays, including the #808080 Election Day label, stay intact.
  }
}
function skipBlocks() {
  while (bytes[offset]) offset += bytes[offset] + 1;
  offset++;
}
if (bytes[10] & 128) readPalette(2 ** ((bytes[10] & 7) + 1));
while (offset < bytes.length) {
  const type = bytes[offset++];
  if (type === 59) break;
  if (type === 33) {
    offset++;
    skipBlocks();
  } else if (type === 44) {
    const flags = bytes[offset + 8];
    offset += 9;
    if (flags & 128) readPalette(2 ** ((flags & 7) + 1));
    offset++;
    skipBlocks();
  } else {
    throw new Error(`Unexpected GIF block: ${type}`);
  }
}
fs.writeFileSync(path, bytes);
console.log(`Corrected ${changed} colors across ${palettes} palettes; frame data and timing preserved.`);
