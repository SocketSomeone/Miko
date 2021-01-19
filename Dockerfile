FROM node:14.15.1-alpine3.12

RUN ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2 \
	# && apk add --no-cache libc6-compat
	&& apk add --no-cache git \
	&& yarn global add pm2

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

# Shared
COPY shared/cache/package.json shared/cache/
COPY shared/databse/package.json shared/databse/
COPY shared/framework/package.json shared/framework/
COPY shared/logger/package.json shared/logger/

# Services
COPY services/bot/package.json services/bot/

RUN yarn install --pure-lockfile

COPY . .

RUN yarn build

# Use docker-compose "command" instead of "CMD" here
