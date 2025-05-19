import { Property } from '../models/propertyModel.js';
import { categorizeProperties } from '../utils/propertyUtils.js';
import { validatePropertyData } from '../utils/propertyValidation.js';
import { Transaction } from '../models/transactionModel.js';

const getProperties = async (req, res) => {
  try {
    const {
      city,
      country,
      minPrice,
      maxPrice,
      minBeds,
      maxBeds,
      minBaths,
      maxBaths,
      propertyType,
      propertyFor,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    let filter = { isAvailable: true };
    if (req.user && req.user.role === 'admin') {
      filter = {};
    }

    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (country) filter['address.country'] = new RegExp(country, 'i');
    if (propertyType) filter.propertyType = new RegExp(propertyType, 'i');
    if (propertyFor) filter.propertyFor = new RegExp(propertyFor, 'i');

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minBeds || maxBeds) {
      filter.bed = {};
      if (minBeds) filter.bed.$gte = Number(minBeds);
      if (maxBeds) filter.bed.$lte = Number(maxBeds);
    }

    if (minBaths || maxBaths) {
      filter.bath = {};
      if (minBaths) filter.bath.$gte = Number(minBaths);
      if (maxBaths) filter.bath.$lte = Number(maxBaths);
    }
    const sortOptions = {};
    const allowedSortFields = ['price', 'bed', 'bath', 'sqft', 'createdAt'];
    if (allowedSortFields.includes(sortBy)) {
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    }

    const properties = await Property.find(filter).sort(sortOptions);

    return res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch properties', error: error.message });
  }
};
const getFeaturedProperties = async (req, res) => {
  try {
    const featuredProperties = await Property.find({
      priority: 'featured',
    }).sort({
      createdAt: -1,
    });
    return res.status(200).json(featuredProperties);
  } catch (error) {
    console.log(error);
  }
};
const getTopPropertyLocations = async (req, res) => {
  try {
    const topProperties = await Property.find({})
      .sort({ createdAt: -1 })
      .limit(2);

    let totalLatitude = 0;
    let totalLongitude = 0;

    topProperties.forEach((property) => {
      totalLatitude += property.address.latitude;
      totalLongitude += property.address.longitude;
    });

    const center = [
      totalLatitude / topProperties.length,
      totalLongitude / topProperties.length,
    ];

    const propertiesForMap = topProperties.map((property) => ({
      id: property._id,
      geocode: [property.address.latitude, property.address.longitude],
      popup: property.title,
      popupImg: property.photos[0]?.image,
    }));
    return res.status(200).json({
      properties: propertiesForMap,
      center,
    });
  } catch (error) {
    console.error('Error fetching top properties:', error);
    return res.status(500).json({
      message: 'Failed to fetch top properties',
      error: error.message,
    });
  }
};
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) {
      return res.status(400).json({
        message: 'property not found',
      });
    }
    return res.status(200).json(property);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getPropertiesByCategory = async (req, res) => {
  try {
    let filter = { isAvailable: true };
    if (req.user && req.user.role === 'admin') {
      filter = {};
    }
    const allProperties = await Property.find(filter);
    const categorizedProperties = categorizeProperties(allProperties);
    // console.log("categorized properties",categorizedProperties);

    return res.status(200).json(categorizedProperties);
  } catch (error) {
    console.error('Error fetching categorized properties:', error);
    return res
      .status(500)
      .json({ message: 'Server error while fetching properties' });
  }
};

const validateProperty = async (req, res) => {
  try {
    // console.log('req.body,', req.body);
    const { isValid, errors } = validatePropertyData(req.body);

    if (!isValid) {
      return res.status(400).json({
        message: 'Validation Error, Please fill all required fields.',
        errors,
      });
    }

    res.status(200).json({ message: 'Data is valid' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const addProperty = async (req, res) => {
  // console.log('req.body_addPty,', req.body);
  // console.log('req.files_addPty,', req.files);


  try {
    const { isValid, errors, value } = validatePropertyData(req.body);

    if (!isValid) {
      return res.status(400).json({
        message: 'Validation Error, Please fill all required fields.',
        errors,
      });
    }
    const photos = req.files.map((file, index) => {
      const titleKey = `photos${index}`;
      const titleObject = req.body[titleKey];
      return { title: titleObject.title, image: file.path };
    });

    const ownerId = req.user._id;

    let paymentTier = 'standard';
    if (value.tempPropertyId) {
      const transaction = await Transaction.findOne({
        tempPropertyId: value.tempPropertyId,
      });

      if (transaction) {
        paymentTier = transaction.paymentTier || 'standard';
      }
    }

    const newProperty = new Property({
      ...value,
      photos,
      owner: ownerId,
      priority: paymentTier,
    });

    await newProperty.save();

    if (value.tempPropertyId) {
      await Transaction.findOneAndUpdate(
        { tempPropertyId: value.tempPropertyId },
        { propertyId: newProperty._id },
        { new: true }
      );
    }
    return res.status(201).json({
      message: 'Property added successfully',
      property: newProperty,
    });
  } catch (error) {
    console.error('error adding property',error);
    res.status(500).json({ message: 'Failed to add property', error });
  }
};
const uploadPropertyImages = async (req, res) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }
  // console.log('files---->', req.files);
  // console.log('body--->', req.body);
  // const photos = req.files.map((file, index) => {
  //   const titleKey = `photos${index}`;
  //   const titleObject = req.body[titleKey];
  //   if (!titleObject || !titleObject.title) {
  //     throw new Error(`Missing title for photo at index ${index}`);
  //   }

  //   return { title: titleObject.title, image: file.path };
  // });

  const photos = req.files.map((file, index) => {
    if (!file || !file.path) {
      console.error('Cloudinary upload failed:', file);
      throw new Error('Cloudinary upload error: File path missing');
    }
    const titleKey = `photos${index}`;
    const titleObject = req.body[titleKey];
    return { title: titleObject?.title || `Photo ${index + 1}`, image: file.path };
  });

  // const photos = files.map((file) => {
  //   // const filePath = path.join('uploads', file.image);
  //   const imageUrl = `${req.protocol}://${req.get('host')}/uploads/properties/${
  //     file.image
  //   }`;
  //   // const imageUrl = `${req.protocol}://${req.get('host')}/${filePath}`;
  //   return { title: file.title, image: imageUrl };
  // });

  res.status(200).json({ photos });
};
const getPropertiesOwnedByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const properties = await Property.find({ owner: userId }).sort({
      createdAt: -1,
    });

    if (!properties || properties.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    const isAdmin = req.user.role === 'admin';
    const isOwner = property.owner.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to update this property' });
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Failed to update property' });
  }
};
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    const isAdmin = req.user.role === 'admin';
    const isOwner = property.owner.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to delete this property' });
    }

    await Property.findByIdAndDelete(id);

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Failed to delete property' }); // Handle errors
  }
};
export {
  getProperties,
  getPropertyById,
  getPropertiesByCategory,
  addProperty,
  getPropertiesOwnedByUser,
  updateProperty,
  deleteProperty,
  validateProperty,
  getTopPropertyLocations,
  getFeaturedProperties,
  uploadPropertyImages,
};
