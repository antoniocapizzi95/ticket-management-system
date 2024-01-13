FROM node:18

EXPOSE 5000

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --no-optional

COPY . .

RUN npm run build

CMD ["npm", "start"]