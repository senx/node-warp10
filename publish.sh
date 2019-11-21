#!/usr/bin/env bash

npm run build
cp package.json ./dist
cd ./dist
npm publish
