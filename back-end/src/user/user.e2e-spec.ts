import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import mongoose, { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Activity } from '../activity/activity.schema';
import { User } from './user.schema';

describe('User - Favorites (e2e)', () => {
  let app: INestApplication;
  let activityModel: Model<Activity>;
  let userModel: Model<User>;
  let userId: string;
  let activityId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    activityModel = moduleFixture.get<Model<Activity>>(
      getModelToken(Activity.name),
    );
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
  });

  beforeEach(async () => {
    const user = await userModel.create({
      email: 'testuser@example.com',
      password: 'password',
      firstName: 'Test',
      lastName: 'User',
    });
    userId = user.id;

    const activity = await activityModel.create({
      name: 'Hiking',
      city: 'Alps',
      price: 100,
      description: 'A beautiful hiking experience.',
      owner: userId,
    });
    activityId = activity.id;
  });

  afterEach(async () => {
    await userModel.deleteMany({});
    await activityModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('should add an activity to user favorites', async () => {
    const query = `
      mutation AddFavorite($userId: ID!, $activityId: ID!) {
        addFavorite(userId: $userId, addFavoriteDto: { activityId: $activityId }) {
          id
          favorites {
            id
            name
            city
            price
          }
        }
      }
    `;

    const variables = {
      userId,
      activityId,
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables })
      .expect(200);

    const favorites = res.body.data.addFavorite.favorites;

    expect(favorites).toHaveLength(1);
    expect(favorites[0]).toMatchObject({
      id: activityId,
      name: 'Hiking',
      city: 'Alps',
      price: 100,
    });
  });

  it('should throw NotFoundException if activity does not exist', async () => {
    const invalidActivityId = new mongoose.Types.ObjectId().toString();

    const query = `
      mutation AddFavorite($userId: ID!, $activityId: ID!) {
        addFavorite(userId: $userId, addFavoriteDto: { activityId: $activityId }) {
          id
        }
      }
    `;

    const variables = {
      userId,
      activityId: invalidActivityId,
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables })
      .expect(200);

    const errors = res.body.errors;
    expect(errors).toBeDefined();
    expect(errors[0].message).toBe('Activity not found');
  });

  it('should throw NotFoundException if user does not exist', async () => {
    const invalidUserId = new mongoose.Types.ObjectId().toString();

    const query = `
      mutation AddFavorite($userId: ID!, $activityId: ID!) {
        addFavorite(userId: $userId, addFavoriteDto: { activityId: $activityId }) {
          id
        }
      }
    `;

    const variables = {
      userId: invalidUserId,
      activityId,
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables })
      .expect(200);

    const errors = res.body.errors;
    expect(errors).toBeDefined();
    expect(errors[0].message).toBe('User not found');
  });
});
