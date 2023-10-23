#!/usr/bin/env bash
yarn version --new-version $1
yarn build
yarn typedoc
cp package.json ./dist
cp README.md ./dist
(cd ./dist && yarn publish --access public  --new-version $1)
git push origin master --tags
git push github master --tags
