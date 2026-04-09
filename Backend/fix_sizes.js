const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const env = {};
fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const uri = env.MONGO_URI || env.MONGODB_URI || 'mongodb://localhost:27017/stall-management';

async function run() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
  const c = db = mongoose.connection.db.collection('stalls');

  const fixes = [
    ['Small (2x2m)', 'Small'], ['Small (2×2m)', 'Small'], ['Compact [2x2m]', 'Small'],
    ['Medium (3x3m)', 'Medium'], ['Medium (3×3m)', 'Medium'], ['Standard [3x3m]', 'Medium'],
    ['Large (4x4m)', 'Large'], ['Large (4×4m)', 'Large'], ['Expansive [5x5m]', 'Large'],
  ];

  for (const [oldVal, newVal] of fixes) {
    const r = await c.updateMany({ size: oldVal }, { $set: { size: newVal } });
    if (r.modifiedCount) console.log(`Fixed "${oldVal}" -> "${newVal}" (${r.modifiedCount})`);
  }

  const all = await c.find({}).toArray();
  console.log(`\nTotal stalls: ${all.length}`);
  all.forEach(s => console.log(`  [${s.status}] ${s.stallName} size:${s.size} zone:${s.locationZone}`));
  console.log('\nAll done!');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
