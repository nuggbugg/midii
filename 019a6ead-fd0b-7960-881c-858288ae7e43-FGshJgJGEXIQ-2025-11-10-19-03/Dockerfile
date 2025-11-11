FROM node:20-slim

# Install Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy Python requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip3 install --break-system-packages -r requirements.txt

# Copy application code
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
