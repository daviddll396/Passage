FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0
WORKDIR /app
COPY --from=build /app/.output ./.output
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
