FROM node:20-alpine3.19 as builder

WORKDIR /app

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

COPY package.json /app
COPY config jobs lib services index.js settings.json /app/
RUN npm install --production

FROM gcr.io/distroless/nodejs20-debian12
ENV NODE_ENV production
WORKDIR /app

COPY --from=builder /tini /tini
COPY --from=builder --chown=nonroot:nonroot /app/. .
COPY --chown=nonroot:nonroot . .

USER nonroot

ENTRYPOINT [ "/tini", "--", "/nodejs/bin/node" ]
CMD [ "index.js" ]

