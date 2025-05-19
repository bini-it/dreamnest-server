import { Property } from '../models/propertyModel.js';
import { PROPERTIESLIST } from './data.js';
export const uploadProperties = async () => {
  try {
    const id = "67a7ce1f3c0c2212ed016e43"
    for (const property of PROPERTIESLIST) {
      const newProperty = new Property({
        ...property,
        owner: id,
      });
      await newProperty.save();
      console.log(`Property at ${property.address.city} uploaded`);
    }
    console.log('All properties uploaded successfully');
    console.log(PROPERTIESLIST.length);

  } catch (err) {
    console.error('Error uploading properties:', err);
  }
};
