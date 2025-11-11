FROM node:20-alpine

# Install Python and ffmpeg
RUN apk add --no-cache python3 py3-pip ffmpeg

WORKDIR /app

# Copy package files and install Node dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Install Python dependencies with no cache
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt && \
    find /usr/lib/python3.11 -name "*.pyc" -delete && \
    find /usr/lib/python3.11 -name "__pycache__" -type d -delete

# Copy application code
COPY . .

# Build Next.js
RUN npm run build && \
    rm -rf node_modules && \
    npm ci --only=production && \
    npm cache clean --force

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
