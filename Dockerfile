FROM node:17.3.0-buster

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD ["npm","start"]