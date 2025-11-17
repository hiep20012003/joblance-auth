#!/bin/sh
set -e

set +e
npm run migrate:up
npm run seed:up
set -e

pm2-runtime start ./src/app.js
