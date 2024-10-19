#FROM node:22-alpine as base
#
#WORKDIR /user-service
#COPY package*.json ./
#
#RUN npm ci
#RUN npm rebuild bcrypt --build-from-source
#COPY . .
#
#
#ENV DB_CLOUD_URI="mongodb+srv://modemhappy:dvVbAqwq5lEOr6WN@cluster0.1oehu.mongodb.net/peerprep?retryWrites=true&w=majority&appName=Cluster0"
#ENV DB_LOCAL_URI="mongodb://127.0.0.1:27017/peerprepUserServiceDB"
#ENV PORT=3001
#ENV ENV=PROD
#ENV JWT_SECRET=you-can-replace-this-with-your-own-secret
#
#
#EXPOSE 3001
#CMD ["npm", "run", "start"]


ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app
EXPOSE 3001

FROM base AS dev
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev \
RUN npm rebuild bcrypt --build-from-source
USER node
COPY . .
CMD npm run dev

FROM base AS prod
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev \
RUN npm rebuild bcrypt --build-from-source
USER node
COPY . .
CMD npm run start