# Use the official Node.js 18 image
FROM node:18-slim

# 1. Install Google Chrome Stable and fonts
# This is required for Puppeteer Stealth to work correctly in Docker
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 2. Tell Puppeteer to use the installed Chrome (Optional but recommended for stability)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# 3. Set the working directory
WORKDIR /app

# 4. Copy package files first (to cache dependencies)
COPY package*.json ./

# 5. Install dependencies (including the new puppeteer-extra)
RUN npm install

# 6. Copy the rest of your application code
COPY . .

# 7. Expose the API port
EXPOSE 3000

# 8. Start the server
CMD ["node", "index.js"]