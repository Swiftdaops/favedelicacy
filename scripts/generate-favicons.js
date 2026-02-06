const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIcoModule = require('png-to-ico');
const pngToIco = pngToIcoModule.default || pngToIcoModule;

async function run() {
  const publicDir = path.join(__dirname, '..', 'public');
  const src = path.join(publicDir, 'chef-icon-512.png');

  if (!fs.existsSync(src)) {
    console.error('Source image not found:', src);
    console.error('Place your 512x512 chef icon at public/chef-icon-512.png and re-run this script.');
    process.exit(1);
  }

  // Generate PNG sizes
  const sizes = [192, 32, 16, 48];
  for (const s of sizes) {
    const out = path.join(publicDir, `chef-icon-${s}.png`);
    await sharp(src).resize(s, s, { fit: 'contain' }).png().toFile(out);
    console.log('Wrote', out);
  }

  // Create favicon.ico from 48x48,32x32,16x16 PNGs
  const icoSources = [
    path.join(publicDir, 'chef-icon-48.png'),
    path.join(publicDir, 'chef-icon-32.png'),
    path.join(publicDir, 'chef-icon-16.png'),
  ];

  try {
    const buf = await pngToIco(icoSources);
    const outIco = path.join(publicDir, 'favicon.ico');
    fs.writeFileSync(outIco, buf);
    console.log('Wrote', outIco);
  } catch (err) {
    console.error('Failed to create favicon.ico:', err);
    process.exit(1);
  }
}

run();
