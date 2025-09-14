# Use Node.js 20 with Debian base for better native compilation support
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies for native compilation
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libusb-1.0-0-dev \
    libudev-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY frontend/package*.json ./

# Install dependencies with legacy peer deps to handle React version conflicts
RUN npm ci --legacy-peer-deps

# Copy source code
COPY frontend/ .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]
