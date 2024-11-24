import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from './favorite.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './favorite.schema';
import { User, UserSchema } from '../user/user.schema';
import { Activity, ActivitySchema } from '../activity/activity.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';

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
});
