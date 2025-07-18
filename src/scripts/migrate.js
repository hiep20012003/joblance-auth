// migrator.js
require('ts-node/register');
require('tsconfig-paths/register');
require('../db/umzug').migrator.runAsCLI();
