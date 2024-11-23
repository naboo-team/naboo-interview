import {
  Resolver,
  ResolveField,
  Parent,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { UserService } from './user.service';
import { Activity } from '../activity/activity.schema';
import { User } from './user.schema';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField(() => [Activity])
  async favorites(@Parent() user: User): Promise<Activity[]> {
    const populatedUser = await this.userService.getById(user.id);

    return populatedUser.favorites as unknown as Activity[];
  }

  @Mutation(() => User)
  async addFavorite(
    @Args('userId') userId: string,
    @Args('addFavoriteDto') addFavoriteDto: AddFavoriteDto,
  ): Promise<User> {
    return this.userService.addFavorite(userId, addFavoriteDto);
  }
}
