#!/bin/sh
set -e

if [ ! -f "node_modules/.bin/sentry-cli" ]; then
	echo "Installing local sentry"
	yarn add @sentry/cli
fi

echo "Release version (x.x.x): "
read VERSION
node_modules/.bin/sentry-cli releases -o miko-someone -p miko files $VERSION upload-sourcemaps ./bin
node_modules/.bin/sentry-cli releases -o miko-someone set-commits --auto $VERSION
node_modules/.bin/sentry-cli releases -o miko-someone -p miko deploys $VERSION new -e production
