import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { FavoriteService } from './favorite.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { Favorite } from './favorite.schema';

@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Mutation(() => Favorite)
  async addFavorite(
    @Args('userId') userId: string,
    @Args('addFavoriteDto') addFavoriteDto: AddFavoriteDto,
  ): Promise<Favorite> {
    return this.favoriteService.addFavorite(userId, addFavoriteDto);
  }

  @Mutation(() => Boolean)
  async removeFavorite(
    @Args('userId') userId: string,
    @Args('activityId') activityId: string,
  ): Promise<boolean> {
    return this.favoriteService.removeFavorite(userId, activityId);
  }

  @Mutation(() => Favorite, { nullable: true })
  async toggleFavorite(
    @Args('userId') userId: string,
    @Args('addFavoriteDto') addFavoriteDto: AddFavoriteDto,
  ): Promise<Favorite | null> {
    const favorite = await this.favoriteService.toggleFavorite(
      userId,
      addFavoriteDto,
    );
    if (!favorite) {
      return null;
    }

    await favorite.populate(['activity', 'user']);
    return favorite;
  }
}
