FROM node:20-alpine AS builder
ARG APP_NAME
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nest build ${APP_NAME}

FROM node:20-alpine AS production
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
CMD node dist/apps/${APP_NAME}/main