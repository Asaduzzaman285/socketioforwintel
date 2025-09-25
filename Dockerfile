# Use Node 18 on Alpine Linux
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY src/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ .

# Expose port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
