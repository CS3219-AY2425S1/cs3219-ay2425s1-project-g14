FROM node:lts-alpine3.20

WORKDIR /frontend
# TODO: don't include the .env file in the COPY
# TODO: multistage build
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]