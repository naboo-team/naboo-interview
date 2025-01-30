import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { User } from './user.schema';
import { ActivityService } from 'src/activity/activity.service';
import { Activity } from 'src/activity/activity.schema';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ContextWithJWTPayload } from 'src/auth/types/context';
import {
  AddFavoriteActivityInput,
  RemoveFavoriteActivityInput,
} from './user.inputs.dto';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly activityService: ActivityService,
  ) {}

  @ResolveField()
  async favoriteActivities(@Parent() user: User): Promise<Activity[]> {
    return this.activityService.findByIds(user.favoriteActivityIds);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async addFavoriteActivity(
    @Context() context: ContextWithJWTPayload,
    @Args('addFavoriteActivityInput')
    { activityId }: AddFavoriteActivityInput,
  ): Promise<User> {
    return this.userService.addFavoriteActivity(
      context.jwtPayload.id,
      activityId,
    );
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async removeFavoriteActivity(
    @Context() context: ContextWithJWTPayload,
    @Args('removeFavoriteActivityInput')
    { activityId }: RemoveFavoriteActivityInput,
  ): Promise<User> {
    return this.userService.removeFavoriteActivity(
      context.jwtPayload.id,
      activityId,
    );
  }
}
