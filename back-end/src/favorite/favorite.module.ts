import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoriteService } from './favorite.service';
import { FavoriteResolver } from './favorite.resolver';
import { Favorite, FavoriteSchema } from './favorite.schema';
import { User, UserSchema } from '../user/user.schema';
import { Activity, ActivitySchema } from '../activity/activity.schema';
import { UserService } from '../user/user.service';
import { ActivityService } from '../activity/activity.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
      { name: User.name, schema: UserSchema },
      { name: Activity.name, schema: ActivitySchema },
    ]),
  ],
  providers: [FavoriteService, FavoriteResolver, UserService, ActivityService],
  exports: [FavoriteService],
})
export class FavoriteModule {}
