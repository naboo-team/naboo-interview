import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { FavoriteService } from './favorite.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { Favorite } from './favorite.schema';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteService: FavoriteService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Favorite)
  async addFavorite(
    @Args('userId') userId: string,
    @Args('addFavoriteDto') addFavoriteDto: AddFavoriteDto,
  ): Promise<Favorite> {
    return this.favoriteService.addFavorite(userId, addFavoriteDto);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async removeFavorite(
    @Args('userId') userId: string,
    @Args('activityId') activityId: string,
  ): Promise<boolean> {
    return this.favoriteService.removeFavorite(userId, activityId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async toggleFavorite(
    @Args('userId') userId: string,
    @Args('activityId') activityId: string,
  ): Promise<boolean> {
    return this.favoriteService.toggleFavorite(userId, activityId);
  }
}
