FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfile and package.json
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

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY package.json ./
COPY apps/web ./apps/web

ENV NEXT_TELEMETRY_DISABLED 1

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build --workspace=@pulse/web

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT 3000

# When using standalone output, server.js is at the root of the output directory
CMD ["node", "server.js"]
