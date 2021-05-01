FROM node:14

WORKDIR /usr/src/WebChecklist/
COPY ./api/package.json ./package.json
RUN npm install

COPY . .
WORKDIR /usr/src/WebChecklist/api

CMD [ "node", "src" ]