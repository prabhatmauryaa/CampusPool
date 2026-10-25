/**
 * Strict college domain validation for CampusPool.
 * Only emails ending with exactly '@kiet.edu' are allowed.
 * Case-insensitive, whitespace-trimmed, and strictly checks domain integrity.
 */
function isValidKietEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim();
  if (!trimmed) {
    return false;
  }

  // Split by '@' to verify exactly one '@' sign
  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) {
    return false;
  }

  // Disallow common invalid characters in local part
  if (localPart.includes(' ') || domainPart.includes(' ')) {
    return false;
  }

  // Strict domain check: domain must be exactly 'kiet.edu'
  const normalizedDomain = domainPart.toLowerCase();
  if (normalizedDomain !== 'kiet.edu') {
    return false;
  }

  // Regex check for valid RFC 5322-compatible local part + kiet.edu
  const emailRegex = /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@kiet\.edu$/i;
  return emailRegex.test(trimmed);
}

module.exports = {
  isValidKietEmail,
  ALLOWED_COLLEGE_DOMAIN: 'kiet.edu',
};
