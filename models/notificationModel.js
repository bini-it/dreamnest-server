import { Schema, model, Types } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['tour', 'message', 'alert', 'offer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Read'],
      default: 'Pending',
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
    idOfProperty: {
      type: Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    idOfTour: {
      type: Types.ObjectId,
      ref: 'TourSchedule',
      required: true,
    },
    initiatorId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyOwnerId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyImage: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

export const Notification = model('Notification', notificationSchema);
