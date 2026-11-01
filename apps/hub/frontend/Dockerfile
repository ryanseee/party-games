FROM node:20-alpine AS build

WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/hub/frontend/package.json apps/hub/frontend/package.json
COPY apps/games/who-who/frontend/package.json apps/games/who-who/frontend/package.json
COPY apps/games/who-who/backend/package.json apps/games/who-who/backend/package.json
COPY apps/games/flappy-flap/frontend/package.json apps/games/flappy-flap/frontend/package.json
RUN npm ci

COPY . .
ARG VITE_WHO_WHO_URL
ENV VITE_WHO_WHO_URL=$VITE_WHO_WHO_URL
ARG VITE_FLAPPY_FLAP_URL
ENV VITE_FLAPPY_FLAP_URL=$VITE_FLAPPY_FLAP_URL
RUN npm run build -w apps/hub/frontend

FROM nginx:1.27-alpine
COPY apps/hub/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/hub/frontend/dist /usr/share/nginx/html
EXPOSE 80
