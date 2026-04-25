FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install only production dependencies for a lean image
RUN npm ci --only=production

# Bundle app source
COPY . .

# Cloud Run defaults to port 8080, but accepts PORT from process.env
ENV PORT=8080
EXPOSE ${PORT}

CMD ["node", "server.js"]
