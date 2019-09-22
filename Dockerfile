FROM node:10.15.3-alpine

WORKDIR /opt/app
COPY . .
RUN npm install

CMD node index
