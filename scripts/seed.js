// optional-requires.js
try {
  require('ts-node/register');
} catch (err) {
  // ignore if module not found
}

try {
  require('tsconfig-paths/register');
} catch (err) {
  // ignore if module not found
}

// chạy seeder
require('../src/database/umzug').seeder.runAsCLI();
