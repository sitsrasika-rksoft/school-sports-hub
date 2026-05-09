# ---------- Build stage ----------
FROM oven/bun:1 AS builder
WORKDIR /app

# Install deps (better caching)
COPY package.json bun.lockb* bunfig.toml* ./
RUN bun install --frozen-lockfile || bun install

# Build the app
COPY . .

# Vite needs these at build time (baked into the client bundle)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

RUN bun run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine AS runner

# SPA-friendly nginx config with /school-sports-hub base path
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built client assets. Vite/TanStack outputs to dist/ (client build).
# If your build emits dist/client, the COPY below still works because we copy dist/.
COPY --from=builder /app/dist /usr/share/nginx/html/school-sports-hub

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
