# Dùng Node LTS
FROM node:18-alpine

# Tạo thư mục app
WORKDIR /app

# Copy package trước để cache layer
COPY package*.json ./

# Cài dependencies
RUN npm install --production

# Copy toàn bộ source
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "app.js"]