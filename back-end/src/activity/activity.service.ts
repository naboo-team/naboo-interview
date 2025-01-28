import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity } from './activity.schema';
import { CreateActivityInput } from './activity.inputs.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name)
    private activityModel: Model<Activity>,
  ) {}

  async findAll(): Promise<Activity[]> {
    return this.activityModel.find().sort({ createdAt: -1 }).exec();
  }

  async findLatest(limit: number = 3): Promise<Activity[]> {
    return this.activityModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  // TODO : check if user exist
  async findByUser(userId: string): Promise<Activity[]> {
    return this.activityModel
      .find({ owner: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Activity> {
    const activity = await this.activityModel.findById(id).exec();
    if (!activity) throw new NotFoundException();
    return activity;
  }

  async findByIds(ids: string[]): Promise<Activity[]> {
    return this.activityModel.find({ _id: { $in: ids } }).exec();
  }

  //TODO : add verification if user is real for security
  //TODO : add verification if connected user is the user ?
  async create(userId: string, data: CreateActivityInput): Promise<Activity> {
    const activity = await this.activityModel.create({
      ...data,
      owner: userId,
    });
    return activity;
  }

  async findCities(): Promise<string[]> {
    return this.activityModel.distinct('city').exec();
  }

  async findByCityAndPriceAndActivityName(
    city: string,
    activity?: string,
    price?: number,
  ): Promise<Activity[]> {
    return this.activityModel
      .find({
        $and: [
          { city },
          ...(price ? [{ price }] : []),
          ...(activity ? [{ name: { $regex: activity, $options: 'i' } }] : []),
        ],
      })
      .exec();
  }

  async countDocuments(): Promise<number> {
    return this.activityModel.estimatedDocumentCount().exec();
  }
}
