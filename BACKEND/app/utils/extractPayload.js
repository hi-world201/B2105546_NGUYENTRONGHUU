exports.extractPayload = (payload, fields) => {
  const obj = {};
  fields.forEach((field) => (obj[field] = payload[field]));

  return obj;
};

exports.filterPayload = (payload, excludedFields) => {
  const obj = { ...payload };
  excludedFields.forEach((field) => delete obj[field]);

  return obj;
};
