import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { randomUUID } from 'crypto';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';
import { User } from './user.schema';
import mongoose from 'mongoose';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, UserModule],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  const data = {
    password: 'password',
    firstName: 'firstName',
    lastName: 'lastName',
  };

  const createUser = async (
    email: string,
    role?: 'user' | 'admin',
  ): Promise<User> => {
    return await userService.createUser({ ...data, email: email, role: role });
  };

  const createUserRaw = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> => {
    return await userService.createUser({
      email,
      password,
      firstName,
      lastName,
    });
  };

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should createUser', async () => {
    // GIVEN
    const email = randomUUID() + '@test.com';
    // WHEN
    const user = await createUser(email);

    // THEN
    // cant find a solution yet to test password has it is hashed by create user
    expect(user).toMatchObject({
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
    });
  });

  it('should createUser with role', async () => {
    // GIVEN
    const email = randomUUID() + '@test.com';
    // WHEN
    const user = await createUser(email, 'admin');

    // THEN
    // cant find a solution yet to test password has it is hashed by create user
    expect(user).toMatchObject({
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'admin',
    });
  });

  it('should findById', async () => {
    // GIVEN
    const email = randomUUID() + '@test.com';
    // WHEN
    const user = await createUser(email);
    const find = await userService.getById(user.id);

    // THEN
    // cant find a solution yet to test password has it is hashed by create user
    expect(find).toMatchObject({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: 'user',
    });
  });

  it('should throw NotFoundException for findById with bad id', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    // WHEN
    const promise = userService.getById(fakeId);
    // THEN
    expect(promise).rejects.toThrowError(NotFoundException);
  });

  it('should findByEmail', async () => {
    // GIVEN
    const email = randomUUID() + '@test.com';
    // WHEN
    const user = await createUser(email);
    const find = await userService.findByEmail(email);

    // THEN
    expect(find).toMatchObject({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: 'user',
    });
  });

  it('should throw NotFoundException for findByEmail with bad email', async () => {
    // GIVEN
    const fakeEmail = randomUUID() + '@test.fakedomain';
    // WHEN
    // WHEN
    const promise = userService.getByEmail(fakeEmail);
    // THEN
    expect(promise).rejects.toThrowError(NotFoundException);
  });

  it('should updateToken', async () => {
    // GIVEN
    const email = randomUUID() + '@test.com';
    // WHEN
    const user = await createUser(email);
    const update = await userService.updateToken(user.id, 'updatedToken');

    // THEN
    expect(update.token).toBeDefined();
    expect(update.token).toBe('updatedToken');
  });

  it('should throw NotFoundException when updateToken with bad user', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    // WHEN
    const promise = userService.updateToken(fakeId, 'updatedToken');
    // THEN
    expect(promise).rejects.toThrowError(NotFoundException);
  });

  it('should setDebugMode to true', async () => {
    // GIVEN
    const email = randomUUID() + '@test.com';
    // WHEN
    const user = await createUser(email);
    const update = await userService.setDebugMode({
      userId: user.id,
      enabled: true,
    });

    // THEN
    expect(update.debugModeEnabled).toBe(true);
  });

  it('should setDebugMode to false', async () => {
    // GIVEN
    const email = randomUUID() + '@test.com';
    // WHEN
    const user = await createUser(email);
    const update = await userService.setDebugMode({
      userId: user.id,
      enabled: false,
    });

    // THEN
    expect(update.debugModeEnabled).toBe(false);
  });

  it('should throw NotFoundException for setDebugMode with bad ID', async () => {
    // GIVEN
    const fakeId = new mongoose.Types.ObjectId().toString();
    // WHEN
    const promise = userService.setDebugMode({
      userId: fakeId,
      enabled: false,
    });
    // THEN
    expect(promise).rejects.toThrowError(NotFoundException);
  });

  it('should count documents', async () => {
    // GIVEN
    let count = 10;
    let results = [];
    for (let i = 0; i < count; i++) {
      results.push(
        await createUserRaw(
          i + '@test',
          i + 'pwd',
          i + 'firstName',
          i + 'lastName',
        ),
      );
    }

    // WHEN
    const documentCount = await userService.countDocuments();

    // THEN
    expect(documentCount).toBeDefined();
    expect(documentCount).toBe(count);
    expect(documentCount).toBe(results.length);
  });
});
