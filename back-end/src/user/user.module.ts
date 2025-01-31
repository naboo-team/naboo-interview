import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { Activity, ActivitySchema } from 'src/activity/activity.schema';
import { UserResolver } from './user.resolver';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
    forwardRef(() => ActivityModule),
  ],
  exports: [UserService],
  providers: [UserService, UserResolver],
})
export class UserModule {}
