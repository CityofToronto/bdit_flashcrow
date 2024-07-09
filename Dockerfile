ARG NODE_VERSION=14.17.5

FROM node:${NODE_VERSION}

COPY ./ssl/extra-ca-certs.cer /usr/local/share/ca-certificates/extra-ca-certs.crt

ENV NODE_ENV development
ENV NODE_EXTRA_CA_CERTS="/usr/local/share/ca-certificates/extra-ca-certs.crt"

RUN node -v

RUN export \
  http_proxy="http://<username>:<password>@proxy.toronto.ca:8080/" \
  https_proxy="http://<username>:<password>@proxy.toronto.ca:8080/"

RUN apt-get install ca-certificates \
    && update-ca-certificates

RUN npm config set cafile /usr/local/share/ca-certificates/extra-ca-certs.crt

WORKDIR /usr/src/cache
COPY package*.json ./
RUN npm install

WORKDIR /usr/src/flashcrow
RUN mkdir -p /usr/src/flashcrow/node_modules