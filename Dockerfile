FROM node:20.4.0-slim AS back-builder

WORKDIR /root

## copy files
COPY ./package.json ./package-lock.json ./tsconfig.json ./.prettierrc ./.eslintrc.js ./.prettierignore ./
COPY back-end/ ./back-end

# install
RUN npm install
RUN npm dedupe

# build to generate artifacts
RUN npm run back:build

FROM node:20.4.0-slim AS front-builder

WORKDIR /root

COPY ./package.json ./package-lock.json ./tsconfig.json ./.eslintrc.js ./.prettierrc ./.prettierignore ./
COPY front-end/ ./front-end

RUN npm install
RUN npm dedupe

COPY --from=back-builder /root/back-end/schema.gql /root/front-end/src/graphql/schema.gql

RUN npm run front:docker:generate-types
## format generated files to avoid prettier errors during build
RUN npm run format:front
RUN npm run front:build

FROM node:20.4.0-slim AS backend

WORKDIR /root

COPY --from=back-builder /root/back-end/dist ./back-end/dist
COPY --from=back-builder /root/back-end/package.json ./back-end/package.json
# [t] is here for conditionally COPY since backend does not generate node modules ! but if it does it wold be copied
COPY --from=back-builder /root/back-end/node_modules[t] ./back-end/node_modules

COPY --from=back-builder /root/node_modules ./node_modules
COPY --from=back-builder /root/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "back:start:prod"]

FROM node:20.4.0-slim AS frontend

WORKDIR /root

COPY --from=front-builder /root/front-end/.next ./front-end/.next
COPY --from=front-builder /root/front-end/public ./front-end/public
COPY --from=front-builder /root/front-end/package.json ./front-end/package.json
# [t] is here for conditionally COPY since backend does not generate node modules ! but if it does it wold be copied
COPY --from=front-builder /root/front-end/node_modules[t] ./front-end/node_modules

COPY --from=front-builder /root/package.json ./package.json
COPY --from=front-builder /root/node_modules ./node_modules

EXPOSE 3001
CMD ["npm", "run", "front:start"]
