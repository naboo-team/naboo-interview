import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { BaseAppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestModule, closeInMongodConnection } from './test/test.module';
import { SignInInput, SignUpInput } from './auth/types';
import { CreateActivityInput } from './activity/activity.inputs.dto';
import { Activity } from './activity/activity.schema';
import mongoose from 'mongoose';

// TODO : refactor test with beforeEach() functions
describe('App e2e', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, BaseAppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    closeInMongodConnection();
  });

  it('app should be defined', () => {
    expect(app).toBeDefined();
  });

  const signUp = async (
    signUpInput: SignUpInput,
  ): Promise<request.Response> => {
    return await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
        mutation($signUpInput: SignUpInput!) {
          register(signUpInput: $signUpInput) {
            email, firstName, lastName
          }
        }
      `,
        variables: { signUpInput: signUpInput },
      })
      .expect(200);
  };

  const sigIn = async (signInInput: SignInInput): Promise<request.Response> => {
    return await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation($signInInput: SignInInput!) {
            login(signInInput:$signInInput) {
              access_token
            }
          }
        `,
        variables: { signInInput: signInInput },
      })
      .expect(200);
  };

  const getTokenFromSignIn = async () => {
    const email = randomUUID() + '@test.com';
    const password = randomUUID();

    const signUpInput: SignUpInput = {
      email,
      password,
      firstName: 'firstName',
      lastName: 'lastName',
    };

    await signUp(signUpInput);

    const signInInput: SignInInput = {
      email,
      password,
    };

    const signInResponse = await sigIn(signInInput);
    return signInResponse.body.data.login.access_token;
  };

  describe('auth resolver', () => {
    it('should sign-up', async () => {
      // GIVEN
      const email = randomUUID() + '@test.com';
      const password = randomUUID();

      const signUpInput: SignUpInput = {
        email,
        password,
        firstName: 'firstName',
        lastName: 'lastName',
      };

      // WHEN
      const signUpResponse = await signUp(signUpInput);

      // THEN
      expect(signUpResponse.body.data.register).toMatchObject({
        email: signUpInput.email,
        firstName: signUpInput.firstName,
        lastName: signUpInput.lastName,
      });
    });

    it('should throw error if user sign up with already used email', async () => {
      // GIVEN
      const email = randomUUID() + '@test.com';
      const password = randomUUID();

      const signUpInput: SignUpInput = {
        email,
        password,
        firstName: 'firstName',
        lastName: 'lastName',
      };

      // WHEN
      await signUp(signUpInput);
      const secondSignUpResponse = await signUp(signUpInput);

      // THEN
      // can access errors in the GraphQL response
      expect(secondSignUpResponse.body.errors).toBeDefined();
      expect(secondSignUpResponse.body.errors[0].message).toBe('Unauthorized');
    });

    it('should sign-in', async () => {
      // GIVEN
      const email = randomUUID() + '@test.com';
      const password = randomUUID();

      const signUpInput: SignUpInput = {
        email,
        password,
        firstName: 'firstName',
        lastName: 'lastName',
      };

      await signUp(signUpInput);

      const signInInput: SignInInput = {
        email,
        password,
      };

      // WHEN
      const signInResponse = await sigIn(signInInput);

      // THEN
      // TODO : find a way to test the token
      const jwt = signInResponse.body.data.login.access_token;
      expect(jwt).toEqual(expect.any(String));
    });

    it('should not sign-in with wrong credentials', async () => {
      // GIVEN
      const email = randomUUID() + '@test.com';
      const password = randomUUID();

      const signUpInput: SignUpInput = {
        email,
        password,
        firstName: 'firstName',
        lastName: 'lastName',
      };

      await signUp(signUpInput);

      const signInInput: SignInInput = {
        email,
        password,
      };

      // WHEN
      const signInResponse = await sigIn(signInInput);

      // THEN
      // TODO : find a way to test the token
      const jwt = signInResponse.body.data.login.access_token;
      expect(jwt).toEqual(expect.any(String));
    });

    it('should logout', async () => {
      // GIVEN
      const email = randomUUID() + '@test.com';
      const password = randomUUID();

      const signUpInput: SignUpInput = {
        email,
        password,
        firstName: 'firstName',
        lastName: 'lastName',
      };

      await signUp(signUpInput);

      const signInInput: SignInInput = {
        email,
        password,
      };

      // WHEN
      const signInResponse = await sigIn(signInInput);
      const jwt = signInResponse.body.data.login.access_token;

      // Verify if connected

      await request(app.getHttpServer())
        .post('/graphql')
        .set('jwt', jwt)
        .send({
          query: `
            query {
              getMe {
                id
                email
                firstName
                lastName
              }
            }
          `,
        })
        .expect(200);

      // THEN

      const logoutResp = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              logout
            }
          `,
        })
        .expect(200);

      expect(logoutResp.body.data.logout).toBe(true);

      // should fail
      const secondGetMeResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('jwt', '') // simulate the clearCookie client side
        .send({
          query: `
            query {
              getMe {
                id
                email
                firstName
                lastName
              }
            }
          `,
        })
        .expect(200);

      expect(secondGetMeResponse.body.errors[0].message).toBe('Invalid token');
    });
  });

  describe('me resolver', () => {
    it('should getMe', async () => {
      // GIVEN
      const email = randomUUID() + '@test.com';
      const password = randomUUID();

      const signUpInput: SignUpInput = {
        email,
        password,
        firstName: 'firstName',
        lastName: 'lastName',
      };

      await signUp(signUpInput);

      const signInInput: SignInInput = {
        email,
        password,
      };

      const signInResponse = await sigIn(signInInput);
      const token = signInResponse.body.data.login.access_token;

      // WHEN
      const getMeResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('jwt', token)
        .send({
          query: `
            query {
              getMe {
                id
                email
                firstName
                lastName
              }
            }
          `,
        })
        .expect(200);

      // THEN
      expect(getMeResponse.body.data.getMe).toMatchObject({
        id: expect.any(String),
        email: signUpInput.email,
        firstName: signUpInput.firstName,
        lastName: signUpInput.lastName,
      });
    });

    it('should throw error with get me without valid token', async () => {
      // WHEN
      const getMeResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('jwt', '')
        .send({
          query: `
            query {
              getMe {
                id
                email
                firstName
                lastName
              }
            }
          `,
        })
        .expect(200);

      expect(getMeResponse.body.errors).toBeDefined();
      expect(getMeResponse.body.errors[0].message).toBe('Invalid token');
    });
  });

  describe('activity resolver', () => {
    let alreadyCreatedActivity: Activity;
    let userToken: string;

    beforeEach(async () => {
      userToken = await getTokenFromSignIn();
      const createActivityInput: CreateActivityInput = {
        name: 'Activity preloaded',
        description: 'Description',
        city: 'City preloaded',
        price: 1000,
      };

      const createActivityResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('jwt', userToken)
        .send({
          query: `
            mutation($createActivityInput: CreateActivityInput!) {
              createActivity(createActivityInput: $createActivityInput) {
                id
                name
                description
                city
                price
              }
            }
          `,
          variables: { createActivityInput: createActivityInput },
        })
        .expect(200);

      alreadyCreatedActivity = createActivityResponse.body.data.createActivity;
    });

    it('should create activity', async () => {
      // GIVEN
      const token = await getTokenFromSignIn();

      const createActivityInput: CreateActivityInput = {
        name: 'Test Activity',
        description: 'A description of the activity',
        city: 'Test City',
        price: 100,
      };

      // WHEN
      const createActivityResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('jwt', token)
        .send({
          query: `
            mutation($createActivityInput: CreateActivityInput!) {
              createActivity(createActivityInput: $createActivityInput) {
                name
                description
              }
            }
          `,
          variables: { createActivityInput: createActivityInput },
        })
        .expect(200);

      // THEN
      expect(createActivityResponse.body.data.createActivity).toBeDefined();
      expect(createActivityResponse.body.data.createActivity.name).toBe(
        createActivityInput.name,
      );
      expect(createActivityResponse.body.data.createActivity.description).toBe(
        createActivityInput.description,
      );
    });

    it('should not create activity if not loged in', async () => {
      // GIVEN
      const createActivityInput: CreateActivityInput = {
        name: 'Test Activity',
        description: 'A description of the activity',
        city: 'Test City',
        price: 100,
      };

      // WHEN
      const createActivityResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('jwt', '') // cannot set value, else server is responding with 500
        .send({
          query: `
            mutation($createActivityInput: CreateActivityInput!) {
              createActivity(createActivityInput: $createActivityInput) {
                name
                description
              }
            }
          `,
          variables: { createActivityInput: createActivityInput },
        })
        .expect(200);

      // THEN
      expect(createActivityResponse.body.errors).toBeDefined();
      expect(createActivityResponse.body.errors[0].message).toBe(
        'Invalid token',
      );
    });

    it('should get activity', async () => {
      // GIVEN
      const id = alreadyCreatedActivity.id;

      // WHEN
      const getActivityResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              getActivity(id: "${id}") {
                name
                description
                city
                price
              }
            }
          `,
        })
        .expect(200);

      // THEN
      expect(getActivityResponse.body.data.getActivity).toBeDefined();
      expect(getActivityResponse.body.data.getActivity.name).toBe(
        alreadyCreatedActivity.name,
      );
      expect(getActivityResponse.body.data.getActivity.description).toBe(
        alreadyCreatedActivity.description,
      );
    });

    it('should not get activity if not existing', async () => {
      // GIVEN
      const invalidId = new mongoose.Types.ObjectId();

      //WHEN
      const getActivityResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              getActivity(id: "${invalidId}") {
                name
                description
              }
            }
          `,
        })
        .expect(200);

      // THEN
      expect(getActivityResponse.body.errors).toBeDefined();
      expect(getActivityResponse.body.errors[0].message).toBe('Not Found');
    });

    it('should get activities', async () => {
      // GIVEN, WHEN
      const getActivitiesResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              getActivities {
                name
                description
              }
            }
          `,
        })
        .expect(200);
      // THEN
      expect(getActivitiesResponse.body.data.getActivities).toBeDefined();
      expect(
        getActivitiesResponse.body.data.getActivities.length,
      ).toBeGreaterThan(0);
      expect(getActivitiesResponse.body.data.getActivities[0].name).toBe(
        alreadyCreatedActivity.name,
      );
    });

    it('should get activities by city', async () => {
      // GIVEN
      const city = alreadyCreatedActivity.city;

      // WHEN
      const getActivitiesByCityResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              getActivitiesByCity(city: "${city}") {
                name
                description
              }
            }
          `,
        })
        .expect(200);

      //THEN

      expect(
        getActivitiesByCityResponse.body.data.getActivitiesByCity,
      ).toBeDefined();
      expect(
        getActivitiesByCityResponse.body.data.getActivitiesByCity.length,
      ).toBeGreaterThan(0);
      expect(
        getActivitiesByCityResponse.body.data.getActivitiesByCity[0].name,
      ).toBe(alreadyCreatedActivity.name);
    });

    it('should get activities by user', async () => {
      // GIVEN, WHEN
      const userActivitiesResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('jwt', userToken)
        .send({
          query: `
            query {
              getActivitiesByUser {
                name
                description
              }
            }
          `,
        })
        .expect(200);

      // THEN
      expect(
        userActivitiesResponse.body.data.getActivitiesByUser,
      ).toBeDefined();
      expect(
        userActivitiesResponse.body.data.getActivitiesByUser.length,
      ).toBeGreaterThan(0);
      expect(userActivitiesResponse.body.data.getActivitiesByUser[0].name).toBe(
        alreadyCreatedActivity.name,
      );
    });

    it('should not get activities if not logged in', async () => {
      // GIVEN, WHEN
      const getActivitiesResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('jwt', '') // empty token simulating not logged in
        .send({
          query: `
            query {
              getActivitiesByUser {
                name
                description
              }
            }
          `,
        })
        .expect(200);

      // THEN
      expect(getActivitiesResponse.body.errors).toBeDefined();
      expect(getActivitiesResponse.body.errors[0].message).toBe(
        'Invalid token',
      );
    });

    it('should get cities', async () => {
      //GIVEN
      //WHEN
      const getCitiesResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetCities {
              getCities
            }
          `,
        })
        .expect(200);

      // THEN
      expect(getCitiesResponse.body.data.getCities).toBeDefined();
      expect(getCitiesResponse.body.data.getCities.length).toBeGreaterThan(0);
    });
  });
});
