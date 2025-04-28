# Use an official Node.js base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

RUN npm run build

# Expose port and start the app
EXPOSE 3000
CMD ["npm", "start"]
