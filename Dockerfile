# Use Node.js base image
FROM node:18

# Create app directory in container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port (change as needed)
EXPOSE 3000

# Start command
CMD ["npm", "start"]