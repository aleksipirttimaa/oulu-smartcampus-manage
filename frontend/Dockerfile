# build angular into static assets using an intermediary container
FROM docker.io/node:16-alpine3.11 as build

ARG APP_BASE_HREF="/"

WORKDIR /var/smartcampus

COPY .browserslistrc ./
COPY angular.json ./
COPY karma.conf.js ./
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.spec.json ./

COPY e2e/ e2e/
COPY src/ src/

RUN npm ci \
  && PATH=$(npm bin):$PATH \
  && ng build --base-href ${APP_BASE_HREF}

# production container runs nginx
# it serves static files and also acts as reverse
# proxy for the backend
FROM docker.io/nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /var/public /usr/share/nginx/html
