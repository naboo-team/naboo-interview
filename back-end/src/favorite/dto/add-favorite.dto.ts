import { Field, ID, InputType } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@InputType()
export class AddFavoriteDto {
  @Field(() => ID)
  @IsMongoId()
  activityId!: string;
}
