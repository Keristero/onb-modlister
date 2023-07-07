FROM node:19.8-alpine3.16

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN npm install

CMD ["npm","start"]