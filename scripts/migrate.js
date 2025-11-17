// migrator.js

// Optional require ts-node/register
try {
  require('ts-node/register');
} catch (err) {
  // Ignore if not found (production build)
}

// Optional require tsconfig-paths/register
try {
  require('tsconfig-paths/register');
} catch (err) {
  // Ignore if not found
}

// Run migrator
require('../src/database/umzug').migrator.runAsCLI();
