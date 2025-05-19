import Joi from 'joi';

export const validatePropertyData = (data) => {
  console.log('@validatePropertyData(req.body)==>', data);

  const propertySchema = Joi.object({
    title: Joi.string().required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().optional(),
      country: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }).required(),
    price: Joi.number().min(0).required(),
    bed: Joi.number().min(0).required(),
    bath: Joi.number().min(0).required(),
    sqft: Joi.number().min(0).required(),
    detail: Joi.string().required(),
    propertyFor: Joi.string().valid('sale', 'rent').required(),
    propertyType: Joi.string().required(),
    yearBuilt: Joi.number().min(1800).max(new Date().getFullYear()).required(),
    discount: Joi.number().min(0).max(100).optional(),
    currency: Joi.string().required(),
    isAvailable: Joi.boolean().required(),
    tempPropertyId: Joi.string().required(),
    photos: Joi.array().items(
      Joi.object({
        previewUrl: Joi.string().required(),
        title: Joi.string().required(),
        image: Joi.object().optional(),
      })
    ),
  });

  const { error: propertyError, value: validatedPropertyData } =
    propertySchema.validate(data, {
      abortEarly: false,
      allowUnknown: true,
    });

  if (propertyError) {
    return {
      isValid: false,
      errors: propertyError.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  return { isValid: true, value: validatedPropertyData };
};
