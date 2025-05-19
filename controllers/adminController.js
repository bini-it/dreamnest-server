import { Property } from '../models/propertyModel.js';
import { TourSchedule } from '../models/tourScheduleModel.js';
import { TransactionMetrics } from '../models/transactionMetricsModel.js';
import { Transaction } from '../models/transactionModel.js';
import { User } from '../models/userModel.js';
import { Types } from 'mongoose';

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log('userid', id);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await Property.deleteMany({ owner: id });

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting User:', error);
    res.status(500).json({ message: 'Failed to delete User' });
  }
};
const getDashBoard = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();

    const totalUsers = await User.countDocuments();
    const latestProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('owner', 'firstName lastName email profilePicture createdAt')
      .lean();
    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    const latestTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'propertyId',
        select: 'photos address',
      })
      .populate({
        path: 'tourId',
        select: 'addressOfTour propertyImage',
      })
      .lean();

    const metrics = await TransactionMetrics.find().lean();
    const totalRevenue = metrics.length > 0 ? metrics[0].totalRevenue : 0;
    const totalTransactions =
      metrics.length > 0 ? metrics[0].totalTransactions : 0;
    return res.status(200).json({
      data: {
        totalProperties: totalProperties || 0, 
        totalUsers: totalUsers || 0,
        latestProperties: latestProperties || [],
        latestUsers: latestUsers || [],
        latestTransactions: latestTransactions || [],
        totalRevenue,
        totalTransactions,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({
      message: 'Server error, unable to fetch dashboard data.',
    });
  }
};
const getLatestProperties = async (req, res) => {
  try {
    const latestProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      data: latestProperties,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error, unable to fetch latest properties.',
    });
  }
};
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'propertyId',
        select: 'photos address',
      })
      .populate({
        path: 'tourId',
        select: 'addressOfTour propertyImage',
      });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch user properties and tour schedules
    const userProperties = await Property.find({ owner: userId });
    const tourSchedules = await TourSchedule.find({ userId: userId });

    // Construct user profile
    const userProfile = {
      _id: user._id,
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
    console.error('Error fetching user by ID:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  const { search, role, sort, hasListedProperty } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role && role !== 'all') {
    query.role = role;
  }

  const sortOrder = sort === 'oldest' ? 1 : -1;

  try {
    let users = await User.find(query)
      .select('firstName lastName email profilePicture createdAt _id role')
      .sort({ createdAt: sortOrder });

    const usersData = await Promise.all(
      users.map(async (user) => {
        const propertiesListed = await Property.countDocuments({
          owner: user._id,
        });

        return {
          ...user.toObject(),
          propertiesListed,
        };
      })
    );
    if (hasListedProperty === 'true') {
      const usersWithPropeties = usersData.filter(
        (user) => user.propertiesListed > 0
      );
      return res.status(200).json(usersWithPropeties);
    }
    return res.status(200).json(usersData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error, unable to fetch users.',
    });
  }
};
const getTourSchedulesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const tours = await TourSchedule.find({ userId })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: 'userId',
        select: 'email',
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
      schedulerEmail: tour.userId.email,
      schedulerId: tour.userId._id,
    }));

    res.json({ tours: formattedTours.length > 0 ? formattedTours : [] });
  } catch (error) {
    console.error('Error fetching user tour schedules:', error);
    return res
      .status(500)
      .json({ message: 'Server error while fetching tour schedules' });
  }
};
const getPropertiesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const properties = await Property.find({ owner: userId });

    if (!properties || properties.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
const getWishlistByUser = async (req, res) => {
  const { userId } = req.params;
  // console.log('getWishlistByUser CALLED');
  try {
    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
export {
  getDashBoard,
  getLatestProperties,
  getAllUsers,
  getAllTransactions,
  getUserById,
  getTourSchedulesByUserId,
  getPropertiesByUser,
  getWishlistByUser,
  deleteUser,
};
