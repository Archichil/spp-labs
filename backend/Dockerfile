FROM node:18-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001
RUN chown -R backend:nodejs /app

USER backend

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "start"]