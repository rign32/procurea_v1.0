FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY nest-cli.json ./
# Copy tsconfig files
COPY tsconfig*.json ./
# Copy prisma schema
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3010
ENV PORT=3010

# Copy and set entrypoint
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Use entrypoint for migrations + start
CMD ["./entrypoint.sh"]
