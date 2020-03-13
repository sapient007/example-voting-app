FROM node:10-slim

WORKDIR /app

RUN npm install -g nodemon
RUN npm install --save @google-cloud/bigquery

COPY package*.json ./

RUN npm ci \
 && npm cache clean --force \
 && mv /app/node_modules /node_modules

COPY . .

ENV PORT 80

EXPOSE 80

CMD ["node", "server.js"]
