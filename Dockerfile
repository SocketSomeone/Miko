FROM node:14.15.1-alpine3.12

RUN ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2 \
	# && apk add --no-cache libc6-compat \
	&& apk add --no-cache git \
	&& yarn global add pm2

WORKDIR /miko

COPY ["package.json", "yarn.lock", "miko.config.yml", "./"]

# Tools
COPY tools/logger/package.json tools/logger/

# Packages
COPY packages/cache/package.json packages/cache/
COPY packages/database/package.json packages/database/
COPY packages/framework/package.json packages/framework/

# Apps
COPY apps/bot/package.json apps/bot/

RUN yarn install --pure-lockfile

COPY . .

RUN yarn build

# Use docker-compose "command" instead of "CMD" here
