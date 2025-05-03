FROM node:latest

COPY . .
RUN npm install
ENV NODE_ENV=production
ENV NODE_PORT=5000
EXPOSE 5000

CMD ["node", "/backend/src/server.js"]