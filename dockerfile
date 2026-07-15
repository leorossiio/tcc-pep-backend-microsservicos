FROM node:20-alpine AS builder
ARG APP_NAME
WORKDIR /app
COPY package*.json ./
# Adicionada a flag --legacy-peer-deps para resolver o conflito de versões do Express v4 vs v5
RUN npm ci --legacy-peer-deps
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