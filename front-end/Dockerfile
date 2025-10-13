# syntax=docker/dockerfile:1.7

# --- build stage ---
    FROM node:20-bullseye AS build
    WORKDIR /app
    COPY package*.json ./
    # Use a cache mount so BuildKit doesn't snapshot the whole node_modules tree
    RUN --mount=type=cache,target=/root/.npm npm ci
    COPY . .
    RUN npm run build
    
    # --- run stage ---
    FROM node:20-bullseye
    RUN npm i -g serve
    WORKDIR /web
    COPY --from=build /app/build ./
    EXPOSE 3000
    CMD ["serve", "-s", ".", "-l", "3000"]
    