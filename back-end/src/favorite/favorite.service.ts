import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Favorite } from './favorite.schema';
import { User } from '../user/user.schema';
import { Activity } from '../activity/activity.schema';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name) private readonly favoriteModel: Model<Favorite>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Activity.name) private readonly activityModel: Model<Activity>,
  ) {}

  async isFavorite(userId: string, activityId: string): Promise<boolean> {
    const favorite = await this.favoriteModel
      .findOne({ user: userId, activity: activityId })
      .exec();
    return !!favorite;
  }

  async addFavorite(
    userId: string,
    addFavoriteDto: AddFavoriteDto,
  ): Promise<Favorite> {
    const { activityId } = addFavoriteDto;

    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    if (!isValidObjectId(activityId)) {
      throw new BadRequestException('Invalid activity ID');
    }

    const userExists = await this.userModel.exists({ _id: userId });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    const activityExists = await this.activityModel.exists({ _id: activityId });
    if (!activityExists) {
      throw new NotFoundException('Activity not found');
    }

    const alreadyFavorite = await this.isFavorite(userId, activityId);
    if (alreadyFavorite) {
      throw new Error('Activity is already a favorite');
    }

    const favorite = new this.favoriteModel({
      user: userId,
      activity: activityId,
    });
    return favorite.save();
  }

  async removeFavorite(userId: string, activityId: string): Promise<boolean> {
    const result = await this.favoriteModel
      .findOneAndDelete({ user: userId, activity: activityId })
      .exec();
    return !!result;
  }

  async getFavoritesByUser(userId: string): Promise<Activity[]> {
    const favorites = await this.favoriteModel
      .find({ user: userId })
      .populate('activity')
      .exec();

    return favorites.map((fav) => fav.activity as Activity);
  }

  async getUsersByFavorite(activityId: string): Promise<User[]> {
    const favorites = await this.favoriteModel
      .find({ activity: activityId })
      .populate('user')
      .exec();

    return favorites.map((fav) => fav.user as User);
  }

  async toggleFavorite(userId: string, activityId: string): Promise<boolean> {
    const existingFavorite = await this.favoriteModel
      .findOne({ user: userId, activity: activityId })
      .exec();

    if (existingFavorite) {
      const deleteResult = await this.favoriteModel.deleteOne({
        _id: existingFavorite._id,
      });

      const isDeleted = deleteResult.deletedCount === 1;
      if (!isDeleted) {
        throw new Error('Failed to remove favorite');
      }

      await this.userModel.findByIdAndUpdate(userId, {
        $pull: { favorites: activityId },
      });

      return false;
    }

    await this.favoriteModel.create({
      user: userId,
      activity: activityId,
    });

    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { favorites: activityId },
    });

    return true;
  }
}
