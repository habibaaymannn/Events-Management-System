# --- build stage ---
    FROM node:20-alpine AS build
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    RUN npm run build
    
    # --- run stage ---
    FROM node:20-alpine
    RUN npm i -g serve
    WORKDIR /web
    COPY --from=build /app/build ./
    EXPOSE 3000
    CMD ["serve", "-s", ".", "-l", "3000"]