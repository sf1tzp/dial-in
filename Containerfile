from node:24 as builder
workdir /app
copy package*.json ./
run npm ci
copy . .
run npm run build

from node:20-alpine
env NODE_ENV=production
workdir /app

# In staging we need to install the .lofi ca certificate
RUN apk --no-cache add ca-certificates curl \
    && rm -rf /var/cache/apk/*
copy certs/* /usr/local/share/ca-certificates/
run update-ca-certificates
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/root_ca.crt

copy package*.json ./
run npm ci --omit=dev
copy --from=builder /app/build ./build
user node
expose 3000
cmd ["node", "build"]
