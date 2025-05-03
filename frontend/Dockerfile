FROM node:latest AS build

WORKDIR /frontend
COPY /frontend /frontend
RUN npm install
RUN npm run build

FROM nginx

COPY --from=build /frontend/dist /dist 
COPY /frontend/nginx.conf /etc/nginx/conf.d/default.conf