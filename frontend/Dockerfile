FROM node:latest AS build

COPY . .
RUN npm install
RUN npm run build

FROM nginx

COPY --from=build dist /dist 
COPY nginx.conf /etc/nginx/conf.d/default.conf