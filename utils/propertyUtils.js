
export const categorizeProperties = (properties) => {
  const categoryMap = {};

  properties.forEach((property) => {
    const category = property.propertyType;

    if (!categoryMap[category]) {
      categoryMap[category] = [];
    }

    categoryMap[category].push(property);
  });

  return Object.keys(categoryMap).map((category) => ({
    category,
    properties: categoryMap[category],
  }));
};
