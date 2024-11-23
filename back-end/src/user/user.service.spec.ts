import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { randomUUID } from 'crypto';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { NotFoundException } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Activity } from '../activity/activity.schema';

describe('UserService', () => {
  let userService: UserService;
  let activityModel: Model<Activity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, UserModule],
    }).compile();

    userService = module.get<UserService>(UserService);
    activityModel = module.get<Model<Activity>>(getModelToken(Activity.name));
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('basic create / get', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

    const fetchedUser = await userService.getById(user.id);

    expect(fetchedUser).toMatchObject({
      email,
      firstName: 'firstName',
      lastName: 'lastName',
    });
  });

  it('should add an activity to user favorites', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

    const activity = await activityModel.create({
      name: 'Hiking',
      city: 'Alps',
      price: 100,
      description: 'A beautiful hiking experience.',
      owner: user._id,
    });

    const addFavoriteDto: AddFavoriteDto = { activityId: activity.id };
    const updatedUser = await userService.addFavorite(user.id, addFavoriteDto);

    expect(updatedUser.favorites.map((fav) => fav._id.toString())).toContain(
      activity._id.toString(),
    );
  });

  it('should throw NotFoundException if user does not exist', async () => {
    const activity = await activityModel.create({
      name: 'Hiking',
      city: 'Alps',
      price: 100,
      description: 'A beautiful hiking experience.',
      owner: new mongoose.Types.ObjectId(),
    });

    const addFavoriteDto: AddFavoriteDto = { activityId: activity.id };

    await expect(
      userService.addFavorite(
        new mongoose.Types.ObjectId().toString(),
        addFavoriteDto,
      ),
    ).rejects.toThrow(new NotFoundException('User not found'));
  });

  it('should populate user favorites with activity objects', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

    const activity = await activityModel.create({
      name: 'Hiking',
      city: 'Alps',
      price: 100,
      description: 'A beautiful hiking experience.',
      owner: user._id,
    });

    const addFavoriteDto: AddFavoriteDto = { activityId: activity.id };
    const updatedUser = await userService.addFavorite(user.id, addFavoriteDto);

    expect(updatedUser.favorites[0]).toMatchObject({
      name: 'Hiking',
      city: 'Alps',
      price: 100,
      description: 'A beautiful hiking experience.',
    });
  });
});
