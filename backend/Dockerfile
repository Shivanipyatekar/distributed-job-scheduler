FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN chmod +x ./start-production.sh

ENV NODE_ENV=production

EXPOSE 5000

USER node

CMD ["./start-production.sh"]
