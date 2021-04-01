FROM node:14

WORKDIR /usr/src/WebChecklist

COPY package.json ./
RUN npm install

COPY api/ .
COPY static/ stadic/

CMD [ "node", "src/index.js" ]