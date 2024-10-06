FROM node:22

WORKDIR /user-service
# TODO: don't include the .env file in the COPY
# TODO: multistage build
COPY package*.json ./
COPY . .
RUN npm install
EXPOSE 3001
CMD ["npm", "run", "start"]
