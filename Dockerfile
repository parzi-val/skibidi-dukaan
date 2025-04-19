# Use Node.js LTS base image
FROM node:22

# Set working directory to /app
WORKDIR /app

# Copy backend folder and its contents
COPY backend/ ./backend

# Set working directory to backend for install and runtime
WORKDIR /app/backend

# Install dependencies
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy rest of backend source
COPY backend/ .

# Copy example env
COPY backend/.env .env

# Expose port
EXPOSE 8080

# Start the backend app
CMD ["npm", "start"]
