FROM node:lts-alpine AS base

FROM base AS devdeps
WORKDIR /temp/dev
COPY package.json ./
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=devdeps /temp/dev/node_modules node_modules
COPY . .
RUN npm run build

FROM base AS proddeps
WORKDIR /temp/prod
COPY --from=devdeps /temp/dev/node_modules node_modules
COPY --from=builder /app/output/package.json ./package.json
RUN npm install --omit=dev --legacy-peer-deps

FROM base AS start
WORKDIR /app

COPY --from=proddeps /temp/prod/node_modules ./node_modules
COPY --from=builder /app/output/build/ ./build/

RUN mkdir -p /app/db
RUN chown -R node:node /app/db

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
USER node
EXPOSE 3000

CMD ["node", "build/server.js"]