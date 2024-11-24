import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../user/user.schema';
import { Activity } from '../activity/activity.schema';

@ObjectType()
@Schema({ timestamps: true })
export class Favorite extends Document {
  @Field(() => ID)
  id!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Field(() => User)
  user!: User;

  @Prop({ type: Types.ObjectId, ref: 'Activity', required: true })
  @Field(() => Activity)
  activity!: Activity;

  @Prop({ default: Date.now })
  @Field(() => Date)
  addedAt!: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
