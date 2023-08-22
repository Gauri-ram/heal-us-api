# mentioned the base image
FROM node:20-alpine3.17

RUN mkdir -p /home/app
COPY . /home/app
WORKDIR /home/app
RUN npm install

CMD ["node", "serverStart.js"]