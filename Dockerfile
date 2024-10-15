FROM node:alpine as install
WORKDIR /app
COPY package*.json .
RUN npm install


FROM install as build
WORKDIR /app
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:alpine as runtime
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]