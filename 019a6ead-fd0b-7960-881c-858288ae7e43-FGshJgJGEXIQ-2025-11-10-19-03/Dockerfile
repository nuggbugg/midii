FROM node:20-slim

# Install Python and dependencies in one layer with cleanup
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Install Python dependencies with aggressive cleanup
COPY requirements.txt ./
RUN pip3 install --break-system-packages --no-cache-dir tensorflow-cpu basic-pitch && \
    find /usr/local/lib/python3.11 -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true && \
    find /usr/local/lib/python3.11 -type d -name "test" -exec rm -rf {} + 2>/dev/null || true && \
    find /usr/local/lib/python3.11 -name "*.pyc" -delete && \
    find /usr/local/lib/python3.11 -name "*.pyo" -delete && \
    find /usr/local/lib/python3.11 -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true && \
    rm -rf /root/.cache

# Copy and build application
COPY . .
RUN npm run build && \
    rm -rf node_modules && \
    npm ci --only=production && \
    npm cache clean --force && \
    rm -rf .next/cache

EXPOSE 3000
CMD ["npm", "start"]
