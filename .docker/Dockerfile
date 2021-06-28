FROM node:14.15.1-alpine3.12

RUN ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2 \
	# && apk add --no-cache g++ gcc make python3 \
	&& yarn global add pm2

WORKDIR /app

COPY ["./package.json", "./yarn.lock", "./"]

# Apps
COPY apps/api/package.json apps/api/
COPY apps/bot/package.json apps/bot/
COPY apps/web/package.json apps/web/

# Packages
COPY packages/common/package.json packages/common/
COPY packages/framework/package.json packages/framework/

RUN yarn install --pure-lockfile \
	&& yarn cache clean

COPY . .

RUN yarn build
