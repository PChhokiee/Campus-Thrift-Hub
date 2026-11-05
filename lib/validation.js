import { CAMPUS_EMAIL_DOMAINS, CAMPUS_EMAIL_EXAMPLE, MIN_PASSWORD_LENGTH } from '@/constants/config';

export const normalizeEmail = (email) => email.trim().toLowerCase();

/**
 * Strict campus check: exactly one "@", a non-empty ID before the allowed
 * suffix, and the address must END with an allowed suffix.
 * e.g. 02240164.cst@rub.edu.bt  ✔    02240164@gmail.com ✘    .cst@rub.edu.bt ✘
 */
export function isCampusEmail(raw) {
  const email = normalizeEmail(raw);
  if (email.split('@').length !== 2) return false;
  return CAMPUS_EMAIL_DOMAINS.some((suffix) => {
    const s = suffix.toLowerCase();
    if (!email.endsWith(s)) return false;
    const prefix = email.slice(0, email.length - s.length);
    return /^[a-z0-9][a-z0-9._-]*$/.test(prefix);
  });
}

export function validateCampusEmail(raw) {
  const email = normalizeEmail(raw);
  if (!email) return 'Please enter your campus email.';
  if (!isCampusEmail(email)) {
    return `Only campus emails are allowed. Use the format ${CAMPUS_EMAIL_EXAMPLE}`;
  }
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Please enter a password.';
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

export function validateName(name) {
  if (name.trim().length < 2) return 'Please enter your full name.';
  return null;
}

export function validateListing(input) {
  const errors = {};
  if (input.title.trim().length < 3) errors.title = 'Title must be at least 3 characters.';
  if (input.description.trim().length < 10) errors.description = 'Please add a description (10+ characters).';
  if (!input.category) errors.category = 'Choose a category.';
  if (!input.isFree) {
    const n = Number(input.price);
    if (!input.price.trim() || !Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
      errors.price = 'Enter a whole-number price, or mark the item as free.';
    }
  }
  if (input.imageCount < 1) errors.images = 'Add at least one photo.';
  return errors;
}
