# Frontend Dockerfile - React App (Multi-stage build)

# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files from frontend subfolder
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ .

# Force rebuild by invalidating cache
RUN echo "Build timestamp: $(date)" > /tmp/build.txt

# Build production bundle
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
