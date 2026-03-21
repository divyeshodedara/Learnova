/**
 * Utility to generate sluggified string from text
 * @param {string} text - Title or any string to slugify
 * @returns {string} - Generated slug
 */
const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
};

module.exports = slugify;
