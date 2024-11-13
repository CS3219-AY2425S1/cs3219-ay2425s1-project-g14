FROM node:22

WORKDIR /user-service
# TODO: don't include the .env file in the COPY
# TODO: multistage build
COPY package*.json ./
# why did it only work with --force
RUN npm install --force --verbose
RUN npm rebuild bcrypt --build-from-source
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start"]