### BACKEND

#### What's used

The frontend is an [NextJS](https://nextjs.org/docs/) app

It uses : 

- `mantine-ui`
- `axios`
- `vitest` and `testing-library`
- `graphql`
- `apollo client`
- `eslint` and `prettier `

### Run project

You should have run `npm install` at the root of the project and make sure your backend is running.

In order to use the data structure defined in the backend, you will need to run the command `npm run generate-types`. It will generate mutations, queries and types you will need from the GraphQL definitions.

You can run the app in watch mode by running  `npm run dev`

### Build

You can build it by running `npm run build`

Then you can run your app by using `npm run start`

### Test

You can run all test suites by running `npm run test`

##### Notes about tests

No tests has been implemented yet, a pertinent way to approach frontend testing would be to add Cypress (or any E2E frontend testing technology) and test user journeys to check for any regressions.

Optionally add critical compents test, and services/utils unit tests when needed.

### Check, Lint, Format

You can check types with `npm run check`

You can format all files with `npm run format`

You can lint all files with `npm run lint`

### Docker build

Please refer to [README.md](./../README.md) at root for building docker images

### More

Optionally you got more npm scripts available in the [package.json](package.json) file