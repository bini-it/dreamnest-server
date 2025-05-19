import { Notification } from '../models/notificationModel.js';

export const createNotification = (
  userId,
  initiatorId,
  title,
  message,
  type,
  status,
  dateOfTour,
  timeOfTour,
  addressOfTour,
  idOfProperty,
  propertyOwnerId,
  idOfTour,
  propertyImage
) => {
  return new Notification({
    userId,
    initiatorId,
    title,
    message,
    type,
    status,
    dateOfTour,
    timeOfTour,
    addressOfTour,
    idOfProperty,
    propertyOwnerId,
    idOfTour,
    propertyImage,
  });
};
