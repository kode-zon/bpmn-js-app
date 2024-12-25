from node:23.4.0-alpine3.21

RUN apk add --no-cache bash && \
    apk add --no-cache openssl && \
    apk add --no-cache envsubst && \
    npm i -g @angular/cli

WORKDIR /etc/share/project/