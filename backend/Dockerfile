FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./src
COPY scripts ./scripts
COPY db ./db
EXPOSE 3000
CMD ["npm", "start"]