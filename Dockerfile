FROM node:14
WORKDIR /code

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --only=production

COPY . .

CMD [ "npm", "start" ]
