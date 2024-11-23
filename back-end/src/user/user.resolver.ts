import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { UserService } from './user.service';
import { Activity } from '../activity/activity.schema';
import { User } from './user.schema';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField(() => [Activity])
  async favorites(@Parent() user: User): Promise<Activity[]> {
    const populatedUser = await this.userService.getById(user.id);

    return populatedUser.favorites as unknown as Activity[];
  }
}
