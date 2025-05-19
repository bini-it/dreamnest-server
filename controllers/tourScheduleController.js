import { Notification } from '../models/notificationModel.js';
import { Property } from '../models/propertyModel.js';
import { TourSchedule } from '../models/tourScheduleModel.js';
import { Transaction } from '../models/transactionModel.js';

const schedulePropertyTour = async (req, res) => {
  const { propertyId, tourDateTime, tempTourId } = req.body;
  const userId = req.user._id;
  const tourDate = new Date(tourDateTime);
  if (isNaN(tourDate.getTime())) {
    return res.status(400).json({ message: 'Invalid tour date and time.' });
  }
  const now = new Date();
  if (new Date(tourDateTime) < now) {
    return res
      .status(400)
      .json({ message: 'Viewing date must be in the future' });
  }
  try {
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const formattedTourDate = new Date(tourDateTime);
    const formattedTime = formattedTourDate.toLocaleTimeString();
    const formattedDate = formattedTourDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const formatedAddress = property.address
      ? `${property.address.street || ''}, ${property.address.city || ''}, ${
          property.address.state || ''
        }`.trim()
      : 'Address not available';
    const ownerId = property.owner;

    const newTourSchedule = new TourSchedule({
      propertyId,
      userId,
      tourDateTime,
      dateOfTour: formattedDate,
      timeOfTour: formattedTime,
      addressOfTour: formatedAddress,
      propertyOwnerId: ownerId,
      propertyImage:
        property.photos && property.photos.length > 0
          ? property.photos[0].image
          : 'local', 
    });

    await newTourSchedule.save();
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { tempTourId },
      { tourId: newTourSchedule._id },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const userNotification = new Notification({
      userId,
      initiatorId: userId,
      title: `Viewing Requested for ${property.title}`,
      message: `You have scheduled a viewing for property: ${formatedAddress} on ${formattedDate} at ${formattedTime}. Please wait for the owner's confirmation.`,
      type: 'tour',
      status: 'Pending',
      dateOfTour: formattedDate,
      timeOfTour: formattedTime,
      addressOfTour: formatedAddress,
      idOfProperty: propertyId,
      propertyOwnerId: ownerId,
      idOfTour: newTourSchedule._id,
      propertyImage: property.photos[0].image,
    });

    const ownerNotification = new Notification({
      userId: ownerId,
      initiatorId: userId,
      title: `New Viewing Request for ${property.title}`,
      message: `A viewing request has been made for your property: ${formatedAddress} on ${formattedDate} at ${formattedTime}. Please confirm or cancel the request.`,
      type: 'tour',
      status: 'Pending',
      dateOfTour: formattedDate,
      timeOfTour: formattedTime,
      addressOfTour: formatedAddress,
      idOfProperty: propertyId,
      propertyOwnerId: ownerId,
      idOfTour: newTourSchedule._id,
      propertyImage: property.photos[0].image,
    });
    await userNotification.save();
    await ownerNotification.save();
    req.io.to(userId.toString()).emit('notification', userNotification);
    req.io.to(ownerId.toString()).emit('notification', ownerNotification);

    res.status(201).json({
      message: 'Viewing scheduled successfully',
      tourSchedule: newTourSchedule,
    });
  } catch (error) {
    console.error('Error scheduling tour:', error);
    return res
      .status(500)
      .json({ message: 'Server error while scheduling tour' });
  }
};

const getUserTourSchedules = async (req, res) => {
  try {
    const userId = req.user._id;

    const tours = await TourSchedule.find({ userId }).sort({
      createdAt: -1,
    });

    if (tours.length === 0) {
      return res.status(200).json({ tours: [] });
    }

    const formattedTours = tours.map((tour) => ({
      tourId: tour._id,
      addressOfTour: tour.addressOfTour,
      tourDateTime: tour.tourDateTime,
      dateOfTour: tour.dateOfTour,
      timeOfTour: tour.timeOfTour,
      propertyId: tour.propertyId,
      propertyOwnerId: tour.propertyOwnerId,
      status: tour.status,
      propertyImage: tour.propertyImage,
      createdAt: tour.createdAt,
    }));

    res.json({ tours: formattedTours.length > 0 ? formattedTours : [] });
  } catch (error) {
    console.error('Error fetching user tour schedules:', error);
    return res
      .status(500)
      .json({ message: 'Server error while fetching tour schedules' });
  }
};

const getUserTourRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const tours = await TourSchedule.find({ propertyOwnerId: userId }).sort({
      createdAt: -1,
    });

    if (tours.length === 0) {
      return res.status(200).json({ tours: [], tourDates: [], toursCount: 0 });
    }

    const formattedTours = tours.map((tour) => ({
      tourId: tour._id,
      addressOfTour: tour.addressOfTour,
      tourDateTime: tour.tourDateTime,
      dateOfTour: tour.dateOfTour,
      timeOfTour: tour.timeOfTour,
      propertyId: tour.propertyId,
      propertyOwnerId: tour.propertyOwnerId,
      status: tour.status,
      propertyImage: tour.propertyImage,
      createdAt: tour.createdAt,
    }));
    const tourDates = tours.map((tour) => tour.tourDateTime);

    res.json({
      tours: formattedTours,
      tourDates,
    });
  } catch (error) {
    console.error('Error fetching user tour schedules:', error);
    return res
      .status(500)
      .json({ message: 'Server error while fetching tour schedules' });
  }
};
const confirmTourSchedule = async (req, res) => {
  const { tourId } = req.params;
  const userId = req.user._id;
  try {
    const tour = await TourSchedule.findById(tourId);

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    if (tour.propertyOwnerId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to confirm this Tour' });
    }
    if (tour.status !== 'Scheduled') {
      return res
        .status(400)
        .json({ message: 'Tour is not in a schedulable state.' });
    }

    tour.status = 'Confirmed';
    await tour.save();
    // / Notify the user
    const userNotification = new Notification({
      userId: tour.userId,
      initiatorId: req.user._id,
      title: `Tour Confirmed for ${tour.addressOfTour}`,
      message: `The tour scheduled for ${tour.dateOfTour} at ${tour.timeOfTour} has been confirmed.`,
      type: 'tour',
      dateOfTour: tour.dateOfTour,
      timeOfTour: tour.timeOfTour,
      addressOfTour: tour.addressOfTour,
      idOfProperty: tour.propertyId,
      propertyOwnerId: tour.propertyOwnerId,
      idOfTour: tour._id,
      propertyImage: tour.propertyImage,
    });
    await userNotification.save();
    req.io.to(tour.userId.toString()).emit('notification', userNotification);

    res.status(200).json({ message: 'Tour confirmed successfully.' });
  } catch (error) {
    console.error('Error confirming Tour:', error);
    res.status(500).json({ message: 'Server error while confirming the Tour' });
  }
};
const cancelTourSchedule = async (req, res) => {
  const { tourId } = req.params;

  try {
    const tour = await TourSchedule.findById(tourId);

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found.' });
    }

    if (tour.propertyOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    if (tour.status === 'Canceled' && tour.status === 'Confirmed') {
      return res
        .status(400)
        .json({ message: 'Tour is not in a schedulable state.' });
    }

    tour.status = 'Canceled';
    await tour.save();

    // Notify the user
    const userNotification = new Notification({
      userId: tour.userId,
      initiatorId: req.user._id,
      title: `Tour Canceled for ${tour.addressOfTour}`,
      message: `The tour scheduled for ${tour.dateOfTour} at ${tour.timeOfTour} has been canceled by the property owner.`,
      type: 'tour',
      dateOfTour: tour.dateOfTour,
      timeOfTour: tour.timeOfTour,
      addressOfTour: tour.addressOfTour,
      idOfProperty: tour.propertyId,
      propertyOwnerId: tour.propertyOwnerId,
      idOfTour: tour._id,
      propertyImage: tour.propertyImage,
    });
    await userNotification.save();
    req.io.to(tour.userId.toString()).emit('notification', userNotification);
    res.status(200).json({ message: 'Tour canceled successfully.' });
  } catch (error) {
    console.error('Error canceling tour:', error);
    return res
      .status(500)
      .json({ message: 'Server error while canceling tour.' });
  }
};

export {
  schedulePropertyTour,
  getUserTourSchedules,
  confirmTourSchedule,
  getUserTourRequests,
  cancelTourSchedule,
};
