FROM node:20-alpine AS build

WORKDIR /hub
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_WHO_WHO_URL
ENV VITE_WHO_WHO_URL=$VITE_WHO_WHO_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /hub/dist /usr/share/nginx/html
EXPOSE 80
