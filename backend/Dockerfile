FROM docker.io/node:16-alpine3.11

WORKDIR /var/manage

COPY package.json ./
COPY package-lock.json ./

COPY src/ src/

RUN npm ci --production

CMD ["node", "src/app.js"]
