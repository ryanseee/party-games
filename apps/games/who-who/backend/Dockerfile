FROM node:20-alpine AS build

WORKDIR /backend
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine

WORKDIR /backend
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /backend/dist ./dist
EXPOSE 5201
CMD ["node", "dist/index.js"]