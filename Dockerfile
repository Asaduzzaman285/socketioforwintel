FROM node:18-alpine

WORKDIR /app

# Copy package.json and lock file first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
