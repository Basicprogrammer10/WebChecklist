FROM node:14

WORKDIR /usr/src/WebChecklist

COPY api/package.json ./
RUN npm install

COPY api/ .
COPY static/ static/

CMD [ "node", "src" ]