FROM keymetrics/pm2-docker-alpine:latest
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 8080

# Start the node app now 
CMD ["npm", "start"]
