import { Schema, model, Types } from 'mongoose';

const tourScheduleSchema = new Schema(
  {
    propertyId: {
      type: Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    propertyImage: {
      type: String,
      required: true,
    },
    propertyOwnerId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tourDateTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Completed', 'Canceled'],
      default: 'Scheduled',
    },
    dateOfTour: {
      type: String,
      required: true,
    },
    timeOfTour: {
      type: String,
      required: true,
    },
    addressOfTour: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const TourSchedule = model('TourSchedule', tourScheduleSchema);
