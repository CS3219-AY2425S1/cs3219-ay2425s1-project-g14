####### See also https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile


FROM node:lts-alpine3.20 AS base

WORKDIR /frontend
# TODO: don't include the .env file in the COPY
# TODO: multistage build
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000


FROM base AS dev
CMD ["npm", "run", "dev"]

FROM base AS prod
CMD ["npm", "run", "build", "&&", "npm", "run", "start"]