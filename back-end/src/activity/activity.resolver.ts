import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Int,
  Parent,
  ResolveField,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Activity } from './activity.schema';

import { CreateActivityInput } from './activity.inputs.dto';
import { User } from 'src/user/user.schema';
import { ContextWithJWTPayload } from 'src/auth/types/context';
import { FavoriteService } from '../favorite/favorite.service';

@Resolver(() => Activity)
export class ActivityResolver {
  constructor(
    private readonly activityService: ActivityService,
    private readonly favoriteService: FavoriteService,
  ) {}

  @ResolveField(() => ID)
  id(@Parent() activity: Activity): string {
    if (!activity._id) {
      throw new Error('Activity ID is undefined.');
    }
    return activity._id.toString();
  }

  @ResolveField(() => User)
  async owner(@Parent() activity: Activity): Promise<User> {
    await activity.populate('owner');
    return activity.owner;
  }

  @Query(() => [Activity])
  async getActivities(): Promise<Activity[]> {
    return this.activityService.findAll();
  }

  @Query(() => [Activity])
  async getLatestActivities(): Promise<Activity[]> {
    return this.activityService.findLatest();
  }

  @Query(() => [Activity])
  @UseGuards(AuthGuard)
  async getActivitiesByUser(
    @Context() context: ContextWithJWTPayload,
  ): Promise<Activity[]> {
    return this.activityService.findByUser(context.jwtPayload.id);
  }

  @Query(() => [String])
  async getCities(): Promise<string[]> {
    const cities = await this.activityService.findCities();
    return cities;
  }

  @Query(() => [Activity])
  async getActivitiesByCity(
    @Args('city') city: string,
    @Args({ name: 'activity', nullable: true }) activity?: string,
    @Args({ name: 'price', nullable: true, type: () => Int }) price?: number,
  ): Promise<Activity[]> {
    return this.activityService.findByCity(city, activity, price);
  }

  @Query(() => Activity)
  async getActivity(@Args('id') id: string): Promise<Activity> {
    return this.activityService.findOne(id);
  }

  @Mutation(() => Activity)
  @UseGuards(AuthGuard)
  async createActivity(
    @Context() context: ContextWithJWTPayload,
    @Args('createActivityInput') createActivity: CreateActivityInput,
  ): Promise<Activity> {
    return this.activityService.create(context.jwtPayload.id, createActivity);
  }

  @ResolveField(() => Boolean)
  @UseGuards(AuthGuard)
  async isFavorite(
    @Parent() activity: Activity,
    @Context() context: ContextWithJWTPayload,
  ): Promise<boolean> {
    if (!activity || !activity.id) {
      console.error('Activity is not defined or missing an ID');
      return false;
    }

    const userId = context.jwtPayload?.id;
    if (!userId) {
      console.error('No user in context');
      return false;
    }

    const isFavorite = await this.favoriteService.isFavorite(
      userId,
      activity.id,
    );
    console.log(
      `Activity ${activity.id} is favorite for user ${userId}:`,
      isFavorite,
    );

    return isFavorite;
  }
}
