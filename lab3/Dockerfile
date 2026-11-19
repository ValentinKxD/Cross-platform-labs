# ЛР7 ТСПП, варіант В: GraphQL-сервер PostProject на Apollo Server (ЛР3 КПП)
FROM node:20-alpine

LABEL author="Valentyn Kachynskyi" \
      version="1.0" \
      description="PostProject GraphQL API (Apollo Server, JWT)"

WORKDIR /app

# Спочатку лише залежності - цей шар кешується, поки не змінився package*.json
COPY package*.json ./
RUN npm ci --omit=dev

# Решта коду сервера
COPY . .

ENV PORT=4001
EXPOSE 4001

# Секрет JWT передається при запуску: docker run -e JWT_SECRET=...
CMD ["node", "index.js"]
