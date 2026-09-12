/**
 * Extract a string id from a plain entity, ObjectId, or raw string.
 * @param {unknown} value
 * @returns {string|null}
 */
const toId = (value) => {
  if (value == null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value.id != null) return String(value.id);
    if (value._id != null) return String(value._id);
  }
  return String(value);
};

/**
 * Map an array of mixed id/entity values to string ids.
 * @param {unknown[]} arr
 * @returns {string[]}
 */
const toIdArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(toId).filter((id) => id != null);
};

/**
 * Convert a Mongoose document (or lean object) into a plain entity with `id`.
 * Recursively normalizes nested docs/arrays when present.
 * @param {unknown} doc
 * @returns {object|null}
 */
const toPlain = (doc) => {
  if (doc == null) return null;
  if (typeof doc.toJSON === 'function') {
    return doc.toJSON();
  }
  if (Array.isArray(doc)) {
    return doc.map(toPlain);
  }
  if (typeof doc !== 'object') return doc;

  const obj = { ...doc };
  if (obj._id != null && obj.id == null) {
    obj.id = String(obj._id);
  }
  delete obj._id;
  delete obj.__v;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (Array.isArray(val)) {
      obj[key] = val.map((item) =>
        item && typeof item === 'object' ? toPlain(item) : item
      );
    } else if (val && typeof val === 'object' && (val._id != null || typeof val.toJSON === 'function')) {
      obj[key] = toPlain(val);
    }
  }
  return obj;
};

module.exports = {
  toId,
  toIdArray,
  toPlain,
};
