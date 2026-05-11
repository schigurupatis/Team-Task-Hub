# 1. Build Phase
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Production Phase
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Only install production dependencies to keep it small
RUN npm install --production
# Copy only the compiled code from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["npm", "start"]
