import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from './favorite.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './favorite.schema';
import { User, UserSchema } from '../user/user.schema';
import { Activity, ActivitySchema } from '../activity/activity.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FavoriteService (Integration)', () => {
  let favoriteService: FavoriteService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let activityModel: Model<Activity>;
  let favoriteModel: Model<Favorite>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Favorite.name, schema: FavoriteSchema },
          { name: User.name, schema: UserSchema },
          { name: Activity.name, schema: ActivitySchema },
        ]),
      ],
      providers: [FavoriteService],
    }).compile();

    favoriteService = module.get<FavoriteService>(FavoriteService);
    userModel = mongoConnection.model<User>('User', UserSchema);
    activityModel = mongoConnection.model<Activity>('Activity', ActivitySchema);
    favoriteModel = mongoConnection.model<Favorite>('Favorite', FavoriteSchema);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    await userModel.deleteMany({});
    await activityModel.deleteMany({});
    await favoriteModel.deleteMany({});
  });

  it('should add a favorite and retrieve it', async () => {
    const user = await userModel.create({
      email: 'test@test.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    });

    const activity = await activityModel.create({
      name: 'Test Activity',
      description: 'A test activity',
      price: 10,
      owner: user._id,
      city: 'Test City',
    });

    const favorite = await favoriteService.addFavorite(user._id.toString(), {
      activityId: activity._id.toString(),
    });

    expect(favorite).toBeDefined();
    expect(favorite.user.toString()).toEqual(user._id.toString());
    expect(favorite.activity.toString()).toEqual(activity._id.toString());

    const favorites = await favoriteService.getFavoritesByUser(
      user._id.toString(),
    );
    expect(favorites).toHaveLength(1);
    expect(favorites[0]._id.toString()).toEqual(activity._id.toString());
  });

  it('should remove a favorite', async () => {
    const user = await userModel.create({
      email: 'test@test.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    });

    const activity = await activityModel.create({
      name: 'Test Activity',
      description: 'A test activity',
      price: 10,
      owner: user._id,
      city: 'Test City',
    });

    await favoriteService.addFavorite(user._id.toString(), {
      activityId: activity._id.toString(),
    });

    const result = await favoriteService.removeFavorite(
      user._id.toString(),
      activity._id.toString(),
    );

    expect(result).toBe(true);

    const favorites = await favoriteService.getFavoritesByUser(
      user._id.toString(),
    );
    expect(favorites).toHaveLength(0);
  });

  it('should toggle a favorite', async () => {
    const user = await userModel.create({
      email: 'test@test.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    });

    const activity = await activityModel.create({
      name: 'Test Activity',
      description: 'A test activity',
      price: 10,
      owner: user._id,
      city: 'Test City',
    });

    const resultAdd = await favoriteService.toggleFavorite(
      user._id.toString(),
      activity._id.toString(),
    );
    expect(resultAdd).toBe(true);

    const favoritesAfterAdd = await favoriteService.getFavoritesByUser(
      user._id.toString(),
    );
    expect(favoritesAfterAdd).toHaveLength(1);

    const resultRemove = await favoriteService.toggleFavorite(
      user._id.toString(),
      activity._id.toString(),
    );
    expect(resultRemove).toBe(false);

    const favoritesAfterRemove = await favoriteService.getFavoritesByUser(
      user._id.toString(),
    );
    expect(favoritesAfterRemove).toHaveLength(0);
  });

  it('should check if an activity is a favorite', async () => {
    const user = await userModel.create({
      email: 'test@test.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    });

    const activity = await activityModel.create({
      name: 'Test Activity',
      description: 'A test activity',
      price: 10,
      owner: user._id,
      city: 'Test City',
    });

    const isFavoriteBefore = await favoriteService.isFavorite(
      user._id.toString(),
      activity._id.toString(),
    );
    expect(isFavoriteBefore).toBe(false);

    await favoriteService.addFavorite(user._id.toString(), {
      activityId: activity._id.toString(),
    });

    const isFavoriteAfter = await favoriteService.isFavorite(
      user._id.toString(),
      activity._id.toString(),
    );
    expect(isFavoriteAfter).toBe(true);
  });

  it('should throw a BadRequestException when adding a favorite with an invalid user ID', async () => {
    const activity = await activityModel.create({
      name: 'Test Activity',
      description: 'A test activity',
      price: 10,
      owner: 'dummyOwnerId',
      city: 'Test City',
    });

    await expect(
      favoriteService.addFavorite('invalidUserId', {
        activityId: activity._id.toString(),
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw a BadRequestException when adding a favorite with an invalid activity ID', async () => {
    const user = await userModel.create({
      email: 'test@test.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    });

    await expect(
      favoriteService.addFavorite(user._id.toString(), {
        activityId: 'invalidActivityId',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw a NotFoundException when adding a favorite for a non-existent user', async () => {
    const activity = await activityModel.create({
      name: 'Test Activity',
      description: 'A test activity',
      price: 10,
      owner: 'dummyOwnerId',
      city: 'Test City',
    });

    await expect(
      favoriteService.addFavorite('62f1c860df1234567890abcd', {
        activityId: activity._id.toString(),
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw a NotFoundException when adding a favorite for a non-existent activity', async () => {
    const user = await userModel.create({
      email: 'test@test.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    });

    await expect(
      favoriteService.addFavorite(user._id.toString(), {
        activityId: '62f1c860df1234567890abcd',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw an error when adding a duplicate favorite', async () => {
    const user = await userModel.create({
      email: 'test@test.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    });

    const activity = await activityModel.create({
      name: 'Test Activity',
      description: 'A test activity',
      price: 10,
      owner: user._id,
      city: 'Test City',
    });

    await favoriteService.addFavorite(user._id.toString(), {
      activityId: activity._id.toString(),
    });

    await expect(
      favoriteService.addFavorite(user._id.toString(), {
        activityId: activity._id.toString(),
      }),
    ).rejects.toThrow(Error);
  });
});
