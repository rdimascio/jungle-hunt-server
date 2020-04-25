FROM node:12.10.0-alpine

WORKDIR /var/api

# add `/app/node_modules/.bin` to $PATH
ENV PATH /var/api/node_modules/.bin:$PATH

COPY package.json /var/api/package.json
COPY package-lock.json /var/api/package-lock.json

RUN npm ci -qy --silent

COPY . /var/api

EXPOSE 8080

CMD ["npm", "start"]
