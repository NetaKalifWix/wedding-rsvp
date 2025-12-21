# Use an official lightweight image as a parent image
FROM node:20-slim

# Create a directory to hold the application code
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image
COPY package*.json ./

# Install all dependencies (including dev for TypeScript compilation)
RUN npm install

# Copy the rest of your source code to the container
COPY . .

# Build TypeScript to JavaScript
RUN npm run build:prod

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

# Cloud Run uses the PORT environment variable, so make sure your app listens to it.
EXPOSE 8080

# Run the compiled JavaScript
CMD [ "node", "dist/app.js" ]

