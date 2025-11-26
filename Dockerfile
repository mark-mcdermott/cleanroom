FROM node:22-slim

# Install pnpm and dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm config set enable-build-scripts true && \
    (pnpm install --frozen-lockfile || pnpm install)

# Install Playwright browsers
RUN npx playwright install chromium

# Copy source code
COPY . .

# Expose dev server port
EXPOSE 5173

# Start development server
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
