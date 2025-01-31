# Naboo interview

## What's used ?

backend

- mongodb
- nestjs
- mongoose
- data mapper pattern
- graphql

frontend

- nextjs (with page router)
- mantine-ui
- axios
- vitest
- graphql
- apollo client

## How to launch project ?

backend

- install docker compose plugin: https://docs.docker.com/compose/install/
- copy `.env.example` to `.env`
- make sure `MONGO_URI` and credentials in `docker-compose.yml` match

```bash
npm ci

npm run start:dev
```

frontend

```bash
npm ci

npm run dev
```

after graphql modification

```bash
# > frontend
npm run generate-types
```

## Connection informations

email: user1@test.fr
password: user1
