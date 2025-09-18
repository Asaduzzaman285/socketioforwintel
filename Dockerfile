FROM node:18-alpine

WORKDIR /app

# Copy package files from src directory
COPY src/package*.json ./

# Install dependencies
RUN npm install

# Copy all source code from src directory

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]