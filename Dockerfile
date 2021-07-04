# set the base image to Node
FROM node:14.16

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ENV CLIENT demo

# avoid million NPM install messages
ENV npm_config_loglevel warn

# Working directory for application
WORKDIR /usr/src/app

# yarn install into WORKDIR
COPY package.json ./
RUN npm install

# copy webapp files to container
COPY . .

CMD npm run start $CLIENT
