FROM node:22-alpine
WORKDIR /app

RUN apk --update --no-cache add curl

COPY package.json .
COPY package-lock.json .

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

ENV PORT 3000
ENV NODE_ENV production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
