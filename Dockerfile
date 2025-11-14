# Stage 1: Build the frontend
FROM node:22 AS frontend-builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Stage 2: Build the backend
FROM node:22 AS backend-builder
WORKDIR /app
COPY server/package.json server/yarn.lock ./server/
RUN cd server && yarn install
COPY server/. .
RUN cd server && yarn build

# Stage 3: Final image
FROM node:18-alpine
WORKDIR /app
COPY --from=frontend-builder /app/dist ./dist
COPY --from=backend-builder /app/dist ./server/dist
COPY --from=backend-builder /app/node_modules ./server/node_modules
COPY server/.env ./server/.env

EXPOSE 3001
CMD ["node", "server/dist/index.js"]
