import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Activity } from '../activity/activity.schema';
import { User } from '../user/user.schema';
import { UserService } from '../user/user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField(() => [Activity])
  async favorites(@Parent() user: User): Promise<Activity[]> {
    const populatedUser = await this.userService.getById(user.id);
    return populatedUser.favorites as unknown as Activity[];
  }
}
