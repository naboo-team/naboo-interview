import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class AddFavoriteActivityInput {
  @Field()
  @IsNotEmpty()
  activityId!: string;
}

@InputType()
export class RemoveFavoriteActivityInput {
  @Field()
  @IsNotEmpty()
  activityId!: string;
}

@InputType()
export class ReorderFavoriteActivitiesInput {
  @Field(() => [ID])
  @IsNotEmpty()
  activityIds!: string[];
}
