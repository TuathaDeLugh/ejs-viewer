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
COPY server/src ./server/src
COPY server/tsconfig.json ./server/
RUN cd server && yarn build

# Stage 3: Final image
FROM node:22-alpine
WORKDIR /app
COPY --from=frontend-builder /app/dist ./dist
COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/node_modules ./server/node_modules
COPY server/.env ./server/.env

EXPOSE 5173
EXPOSE 5174
CMD ["node", "server/dist/index.js"]
