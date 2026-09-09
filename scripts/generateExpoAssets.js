const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const assetsDir = path.join(root, 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

// 1x1 transparent PNG encoded as base64; valid for Expo asset resolution.
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAF' +
  'c2+/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJ0UkG' +
  'AAAAAAgIAP6A3QAAAAAJJRU5ErkJggg==';

const iconPath = path.join(assetsDir, 'icon.png');
const splashPath = path.join(assetsDir, 'splash.png');

const pngBuffer = Buffer.from(pngBase64, 'base64');
fs.writeFileSync(iconPath, pngBuffer);
fs.writeFileSync(splashPath, pngBuffer);

console.log('Created assets:', iconPath, splashPath);
