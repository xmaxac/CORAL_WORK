FROM node:18.17.1-slim

WORKDIR /app

COPY ./ /app/

RUN npm install

EXPOSE 4000

CMD ["sh", "-c", "node server.js"]
