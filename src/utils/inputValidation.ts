/**
 * Input validation and sanitization utilities
 * Protects against XSS, injection, and malicious input
 */

/**
 * Removes HTML tags and potentially dangerous characters from text
 * Used for text inputs that might be displayed as HTML
 */
export const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .trim();
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that a number is within acceptable range
 */
export const validateNumericRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): { valid: boolean; error?: string } => {
  if (isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }
  if (value < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }
  if (value > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }
  return { valid: true };
};

/**
 * Truncates text to maximum length and adds ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Sanitizes textarea input (allows basic formatting but removes dangerous content)
 */
export const sanitizeTextarea = (text: string | null | undefined, maxLength: number = 2000): string => {
  if (!text) return '';
  
  const sanitized = sanitizeText(text);
  return truncateText(sanitized, maxLength);
};

/**
 * Validates and sanitizes name fields
 * Allows letters, spaces, hyphens, and apostrophes only
 */
export const validateName = (name: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  
  const sanitized = sanitizeText(name);
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  
  if (!nameRegex.test(sanitized)) {
    return { 
      valid: false, 
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes' 
    };
  }
  
  if (sanitized.length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' };
  }
  
  return { valid: true, sanitized };
};

/**
 * Validates race time format (MM:SS or HH:MM:SS)
 */
export const validateRaceTime = (time: string): { valid: boolean; error?: string } => {
  const timeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;
  
  if (!timeRegex.test(time)) {
    return { valid: false, error: 'Time must be in MM:SS or HH:MM:SS format' };
  }
  
  const parts = time.split(':').map(Number);
  
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    if (seconds >= 60) {
      return { valid: false, error: 'Seconds must be less than 60' };
    }
    if (minutes < 0) {
      return { valid: false, error: 'Invalid time' };
    }
  } else if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    if (seconds >= 60 || minutes >= 60) {
      return { valid: false, error: 'Invalid time values' };
    }
    if (hours < 0) {
      return { valid: false, error: 'Invalid time' };
    }
  }
  
  return { valid: true };
};

/**
 * Prevents SQL injection by escaping special characters
 * Note: Use parameterized queries instead when possible
 */
export const escapeSQL = (text: string): string => {
  return text
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
};

/**
 * Rate limiting helper: Check if enough time has passed since last action
 */
export const checkRateLimit = (
  lastActionTimestamp: number | null,
  cooldownMs: number
): { allowed: boolean; remainingMs?: number } => {
  if (!lastActionTimestamp) {
    return { allowed: true };
  }
  
  const now = Date.now();
  const elapsed = now - lastActionTimestamp;
  
  if (elapsed >= cooldownMs) {
    return { allowed: true };
  }
  
  return { 
    allowed: false, 
    remainingMs: cooldownMs - elapsed 
  };
};

/**
 * Validates file upload size and type
 */
export const validateFileUpload = (
  file: File,
  maxSizeMB: number,
  allowedTypes: string[]
): { valid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `File size must be less than ${maxSizeMB}MB` 
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type must be one of: ${allowedTypes.join(', ')}` 
    };
  }
  
  return { valid: true };
};
