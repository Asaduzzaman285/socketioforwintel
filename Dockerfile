FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json from src
COPY src/package*.json ./

# Install dependencies
RUN npm install

# Copy source code from src
COPY src/ .

EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
