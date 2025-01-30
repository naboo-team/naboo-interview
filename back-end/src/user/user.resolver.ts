import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from './user.schema';
import { ActivityService } from 'src/activity/activity.service';
import { Activity } from 'src/activity/activity.schema';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly activityService: ActivityService) {}

  @ResolveField()
  async favoriteActivities(@Parent() user: User): Promise<Activity[]> {
    return this.activityService.findByIds(user.favoriteActivityIds);
  }
}
