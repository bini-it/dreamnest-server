import { User } from '../models/userModel.js';
import { Property } from '../models/propertyModel.js';
import { Notification } from '../models/notificationModel.js';
import { TourSchedule } from '../models/tourScheduleModel.js';

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userProperties = await Property.find({ owner: req.user._id });
    const tourSchedules = await TourSchedule.find({ userId: req.user._id });

    const userProfile = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      dateJoined: user.createdAt,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      wishlistCount: user.wishlist.length,
      propertyCount: userProperties.length || 0,
      tourScheduleCount: tourSchedules.length || 0,
    };
    return res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res
      .status(500)
      .json({ message: 'Server error while fetching notifications' });
  }
};
const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You do not have permission to mark this notification as read',
      });
    }
    if (notification.status === 'Read') {
      return res.status(200).json({
        message: 'Notification is already marked as read',
        notification,
      });
    }
    notification.status = 'Read';
    await notification.save();
    res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res
      .status(500)
      .json({ message: 'Server error while marking notification as read' });
  }
};
const updateUserProfile = async (req, res) => {
  const { firstName, lastName, email, phoneNumber } = req.body;
  const userId = req.user._id;
  // console.log('req.body////', req.body);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    await user.save();

    const userProfile = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadProfilePicture = async (req, res) => {
  // console.log('req.file////', req.file);
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = req.file.path;
    await user.save();

    res.status(200).json({ profilePicture: user.profilePicture });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const userWishlist = async (req, res) => {
  try {
    // console.log('userWishlist CALLED');

    const user = await User.findById(req.user._id).populate('wishlist');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const validWishlist = [];
    for (const property of user.wishlist) {
      const exists = await Property.find({ _id: property._id });
      if (exists) validWishlist.push(property);
    }

    if (validWishlist.length !== user.wishlist.length) {
      user.wishlist = validWishlist.map((property) => property._id);
      await user.save();
    }

    res.json({ wishlist: validWishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addToWishlist = async (req, res) => {
  const { propertyId } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const propertyExists = await Property.exists({ _id: propertyId });
    if (!propertyExists) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (user.wishlist.includes(propertyId)) {
      return res
        .status(400)
        .json({ message: 'Property is already in the wishlist' });
    }

    user.wishlist.push(propertyId);
    await user.save();
    const updatedUser = await User.findById(userId).populate('wishlist');
    return res.status(200).json({
      message: 'Property added to wishlist',
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add property to wishlist' });
  }
};

const removeFromWishlist = async (req, res) => {
  const { propertyId } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.wishlist.includes(propertyId)) {
      return res.status(400).json({ message: 'Property not in wishlist' });
    }
    const propertyExists = await Property.exists({ _id: propertyId });
    if (!propertyExists) {
      return res
        .status(404)
        .json({ message: 'Property no longer exists in the system' });
    }
    user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
    await user.save();

    const updatedUser = await User.findById(userId).populate('wishlist');
    res.status(200).json({
      message: 'Property removed from wishlist',
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to remove property from wishlist' });
  }
};

export {
  removeFromWishlist,
  addToWishlist,
  userWishlist,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  getUserNotifications,
  markNotificationAsRead,
};
