FROM node:alpine
WORKDIR /usr/server/index
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install
COPY ./controller ./controller
COPY ./database ./database
COPY ./middleware ./middleware
COPY ./model ./model
COPY ./routes ./routes
COPY ./.env ./
COPY ./index.js ./index.js
CMD ["npm","start"]
