FROM node:lts-alpine3.20

WORKDIR /comms
COPY package*.json ./
RUN npm install --force
COPY . .
EXPOSE 4001
CMD ["npm", "run", "dev"]
