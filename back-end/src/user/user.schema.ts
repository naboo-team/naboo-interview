import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Activity } from 'src/activity/activity.schema';

@ObjectType()
@Schema({ timestamps: true })
export class User extends Document {
  @Field(() => ID)
  id!: string;

  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role!: 'user' | 'admin';

  @Field()
  @Prop({ required: true })
  firstName!: string;

  @Field()
  @Prop({ required: true })
  lastName!: string;

  @Field()
  @Prop({ required: true, unique: true })
  email!: string;

  @Field()
  @Prop({ required: true })
  password!: string;

  @Prop({
    required: true,
    // default: [],
    type: [{ type: Types.ObjectId, ref: 'Activity' }],
  })
  favoriteActivityIds!: string[];

  @Field(() => [Activity])
  favoriteActivities!: Activity[];

  @Prop()
  token?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
