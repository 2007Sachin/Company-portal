FROM node:20-alpine AS builder
WORKDIR /app

# Copy root lockfile and package.json
COPY package.json package-lock.json ./
# Copy workspace packages
COPY packages ./packages
# Copy all app package.jsons to satisfy workspaces
COPY apps/web/package.json ./apps/web/
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/candidate-service/package.json ./apps/candidate-service/
COPY apps/pipeline-service/package.json ./apps/pipeline-service/
COPY apps/notification-service/package.json ./apps/notification-service/
COPY apps/copilot-service/package.json ./apps/copilot-service/
COPY apps/jd-parser-service/package.json ./apps/jd-parser-service/

RUN npm ci

# Copy service code
COPY apps/candidate-service ./apps/candidate-service

# Build shared packages
RUN npm run build --workspace=@pulse/shared-utils
RUN npm run build --workspace=@pulse/shared-types

# Build the service
RUN npm run build --workspace=@pulse/candidate-service

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/candidate-service/dist ./dist
COPY --from=builder /app/apps/candidate-service/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3002
EXPOSE 3002

CMD ["node", "dist/index.js"]
