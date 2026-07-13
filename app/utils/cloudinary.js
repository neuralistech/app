import config from '~/config.json';

// Public cloud name only (not a secret). Env wins when injected at build/runtime.
const cloudName =
  (typeof process !== 'undefined' && process.env.CLOUDINARY_CLOUD_NAME) ||
  config.cloudinaryCloud;

const BASE = `https://res.cloudinary.com/${cloudName}/image/upload`;

/**
 * Returns a Cloudinary URL with the given transformation and image path.
 * @param {string} transform - e.g. 'w_1280'
 * @param {string} path      - e.g. 'v123/neuralis/projects/foo.jpg'
 */
export function cdnUrl(transform, path) {
  return `${BASE}/${transform}/${path}`;
}

/**
 * Returns srcSet + placeholder for a given image path and widths.
 * @param {string} path    - Image path in Cloudinary (after the version)
 * @param {number[]} widths
 */
export function cdnSrcSet(path, widths) {
  const srcSet = widths.map(w => `${cdnUrl(`w_${w}`, path)} ${w}w`).join(', ');
  const placeholder = cdnUrl('w_20,e_blur:1000', path);
  return { srcSet, placeholder };
}
