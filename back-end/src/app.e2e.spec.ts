import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { BaseAppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestModule, closeInMongodConnection } from './test/test.module';

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

  test('sign-up, sign-in, getMe', async () => {
    const email = randomUUID() + '@test.com';
    const password = randomUUID();

    const signUpResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            register(signUpInput:{ email: "${email}", password: "${password}", firstName: "firstName", lastName: "lastName" }) {
              email
            }
          }
        `,
      })
      .expect(200);

    expect(signUpResponse.status).toBe(200);
    expect(signUpResponse.body.data.register.email).toBe(email);

    const signInResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(signInInput:{ email: "${email}", password: "${password}" }) {
              access_token
            }
          }
        `,
      })
      .expect(200);

    expect(signInResponse.status).toBe(200);
    const jwt = signInResponse.body.data.login.access_token;
    expect(jwt).toEqual(expect.any(String));

    const getMeResponse = await request(app.getHttpServer())
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

    expect(getMeResponse.body.data.getMe).toMatchObject({
      id: expect.any(String),
      email,
      firstName: 'firstName',
      lastName: 'lastName',
    });
  });
});
