### BACKEND

#### What's used

The backend is an [Nest.JS](https://docs.nestjs.com/) app

It uses : 

- `mongodb`
- `mongoose`
- `data mapper pattern`
- `graphql`
- `jest` and `supertest`
- `eslint` and `prettier`

### Run project

You should have run `npm install` at the root of the project and make sure you got a MongoDB up (for more please refer to [README.md](./../README.md) file at root)

You can run the app by using `npm run start`

You can also run in watch mode by running  `npm run start:dev`

### Build

You can build it by running `npm run build`

Then you can run your app by using `npm run start:prod`

### Test

You can run all test suites by running `npm run test`

##### Notes about tests

Few points that could be improved:
- More reusability in tests
- Testing the auth better
- Factories or helpers for data creation

### Check, Lint, Format

You can check types with `npm run check`

You can format all files with `npm run format`

You can lint all files with `npm run lint` 

### Docker build

Please refer to [README.md](./../README.md) at root for building docker images

### More

Optionally you got more npm scripts available in the [package.json](package.json) file