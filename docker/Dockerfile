FROM node:14.15.1-alpine3.12

RUN yarn global add pm2

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

COPY . .

RUN yarn install --pure-lockfile

RUN yarn build
