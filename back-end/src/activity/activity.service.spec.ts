import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { ActivityModule } from './activity.module';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';
import { Activity } from './activity.schema';
import { CreateActivityInput } from './activity.inputs.dto';
import mongoose from 'mongoose';
import { NotFoundException } from '@nestjs/common';

describe('ActivityactivityService', () => {
  let activityService: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, ActivityModule],
    }).compile();

    activityService = module.get<ActivityService>(ActivityService);
  });

  const data: CreateActivityInput = {
    name: 'name',
    city: 'city',
    description: 'description',
    price: 100,
  };

  const createActivity = (userId: string): Promise<Activity> => {
    return activityService.create(userId, data);
  };

  const createActivityRaw = (
    userId: string,
    name: string,
    city: string,
    description: string,
    price: number,
  ): Promise<Activity> => {
    return activityService.create(userId, { name, city, description, price });
  };

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(activityService).toBeDefined();
  });

  it('should createActivity', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    // WHEN
    const activity = await createActivity(fakeId);
    // THEN
    expect(activity).toMatchObject(data);
  });

  it('should listAll', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    const count = 10;
    const results: Activity[] = [];
    // WHEN
    for (let i = 0; i < count; i++) {
      results.push(
        await createActivityRaw(
          fakeId,
          'name' + i,
          'city' + i,
          'description' + i,
          i,
        ),
      );
    }
    const activities = await activityService.findAll();

    // THEN
    expect(activities.length).toEqual(results.length);
    expect(activities.map((a) => a.id).sort()).toEqual(
      results.map((a) => a.id).sort(),
    );
  });

  it('should findById', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    const activity = await createActivity(fakeId);
    // WHEN
    const find = await activityService.findById(activity.id);
    // THEN
    expect(find).toMatchObject(data);
  });

  it('should throw NotFoundException fo findById with bad id', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    // WHEN
    const promise = activityService.findById(fakeId);
    // THEN
    expect(promise).rejects.toThrow(NotFoundException);
  });

  it('should findByIds', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    const count = 10;
    const results: Activity[] = [];
    // WHEN
    for (let i = 0; i < count; i++) {
      results.push(
        await createActivityRaw(
          fakeId,
          'name' + i,
          'city' + i,
          'description' + i,
          i,
        ),
      );
    }
    const subGroup = results.splice(0, results.length / 2);
    const activities = await activityService.findByIds(
      subGroup.map((a) => a.id),
    );
    // THEN
    expect(activities.length).toEqual(subGroup.length);
    expect(activities.map((a) => a.id)).toEqual(subGroup.map((a) => a.id));
  });

  it('should findByCityAndPriceAndActivityName', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    const count = 10;
    const results: Activity[] = [];
    // WHEN
    // all in the same city
    for (let i = 0; i < count; i++) {
      results.push(
        await createActivityRaw(
          fakeId,
          'name' + i,
          'city',
          'description' + i,
          i,
        ),
      );
    }

    // WHEN
    //all
    const findByCity = await activityService.findByCityAndPriceAndActivityName(
      'city',
    );
    // only one
    const findByCityAndPrice =
      await activityService.findByCityAndPriceAndActivityName(
        'city',
        undefined,
        5,
      );
    // all since we prefixed with "name"
    const findByCityAndName =
      await activityService.findByCityAndPriceAndActivityName('city', 'nam');
    // only one
    const findByCityAndNameAndPrice =
      await activityService.findByCityAndPriceAndActivityName(
        'city',
        'name1',
        1,
      );

    // THEN
    expect(findByCity.length).toEqual(results.length);
    expect(findByCity.map((a) => a.id)).toEqual(results.map((a) => a.id));

    expect(findByCityAndPrice.length).toEqual(1);
    // dirty way to check if it's the unique item of the list
    expect(findByCityAndPrice.map((a) => a.name)).toEqual(
      results.filter((a) => a.price === 5).map((a) => a.name),
    );

    expect(findByCityAndName.length).toEqual(results.length);
    expect(findByCityAndName.map((a) => a.id)).toEqual(
      results.map((a) => a.id),
    );

    expect(findByCityAndNameAndPrice.length).toEqual(1);
    // dirty way to check if it's the unique item of the list
    expect(findByCityAndNameAndPrice.map((a) => a.name)).toEqual(
      results.filter((a) => a.price === 1).map((a) => a.name),
    );
  });

  it('should findCities', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    const count = 10;
    const results: Activity[] = [];
    // WHEN
    for (let i = 0; i < count; i++) {
      results.push(
        await createActivityRaw(
          fakeId,
          'name' + i,
          'city' + i,
          'description' + i,
          i,
        ),
      );
    }

    // WHEN
    const cities = await activityService.findCities();

    // THEN
    expect(cities.sort()).toEqual(results.map((a) => a.city).sort());
  });

  it('should findByUser', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    const fakeId2 = new mongoose.Types.ObjectId().toString();
    const count = 10;
    const results: Activity[] = [];
    // WHEN
    for (let i = 0; i < count; i++) {
      results.push(
        await createActivityRaw(
          fakeId,
          'name' + i,
          'city' + i,
          'description' + i,
          i,
        ),
      );
    }
    for (let i = 0; i < count; i++) {
      results.push(
        await createActivityRaw(
          fakeId2,
          'name' + i,
          'city' + i,
          'description' + i,
          i,
        ),
      );
    }

    // WHEN
    const activities = await activityService.findByUser(fakeId);

    // THEN
    expect(activities.length).toEqual(results.length / 2);
    expect(activities.map((a) => a.name).sort()).toEqual(
      results
        .filter((a) => a.owner.toString() === fakeId)
        .map((a) => a.name)
        .sort(),
    );
  });

  it('should findLatest', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    const count = 10;
    const results: Activity[] = [];
    // WHEN
    for (let i = 0; i < count; i++) {
      results.push(
        await createActivityRaw(
          fakeId,
          'name' + i,
          'city' + i,
          'description' + i,
          i,
        ),
      );
    }

    const latests = await activityService.findLatest();
    // THEN
    expect(latests.length).toBe(3);
    expect(latests.map((a) => a.name).sort()).toEqual(
      results
        .slice(results.length - 3, results.length)
        .map((a) => a.name)
        .sort(),
    );
  });
});
