FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

# First, remove bcrypt and install bcryptjs (a pure JS implementation)
RUN npm uninstall bcrypt && npm install bcryptjs && npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 