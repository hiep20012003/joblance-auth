#!/bin/sh
set -e

npm run migrate:up
npm run seed:up
pm2-runtime start ./src/app.js
