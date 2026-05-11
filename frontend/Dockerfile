# 1. Build Phase
FROM node:20-alpine AS builder
WORKDIR /app

# Copy files relative to the frontend directory
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Production Phase (Lightweight)
FROM node:20-alpine
WORKDIR /app

# Install 'serve' to run the static Vite/React build
RUN npm install -g serve

# Copy only the built files from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
