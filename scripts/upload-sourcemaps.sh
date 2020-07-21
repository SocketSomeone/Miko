#!/bin/sh
set -e

if [ ! -f "node_modules/.bin/sentry-cli" ]; then
	echo "Installing local sentry"
	npm install @sentry/cli
fi

echo "Switching to master"
git checkout master

echo "Pulling newest commit"
git pull

echo "Running build"
npm run build

echo "Release version (x.x.x): "
read VERSION
node_modules/.bin/sentry-cli releases -o miko-someone -p miko files $VERSION upload-sourcemaps ./bin
node_modules/.bin/sentry-cli releases -o miko-someone set-commits --auto $VERSION
node_modules/.bin/sentry-cli releases -o miko-someone -p miko deploys $VERSION new -e production
