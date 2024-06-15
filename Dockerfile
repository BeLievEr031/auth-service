FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# This used for documentation purpose
EXPOSE 5000
CMD [ "npm","run","dev" ]
