// Session code validation
export const isValidSessionCode = (code: string): boolean => {
  // Session code should be 6 characters long and contain only uppercase letters and numbers
  const sessionCodeRegex = /^[A-Z0-9]{6}$/;
  return sessionCodeRegex.test(code);
};

// Participant name validation
export const isValidParticipantName = (name: string): boolean => {
  // Name should be between 2 and 50 characters, containing letters, numbers, spaces, and basic punctuation
  const nameRegex = /^[a-zA-Z0-9\s\-'.]{2,50}$/;
  return nameRegex.test(name);
};

// Session name validation
export const isValidSessionName = (name: string): boolean => {
  // Session name should be between 3 and 100 characters
  return name.trim().length >= 3 && name.trim().length <= 100;
};

// Photo validation
export const isValidPhotoFile = (file: File): boolean => {
  // Check file type
  const validTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return false;
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return false;
  }

  return true;
};

// Error messages
export const ValidationErrors = {
  SESSION_CODE:
    "Session code must be 6 characters long and contain only uppercase letters and numbers",
  PARTICIPANT_NAME:
    "Name must be between 2 and 50 characters and contain only letters, numbers, spaces, and basic punctuation",
  SESSION_NAME: "Session name must be between 3 and 100 characters",
  PHOTO_TYPE: "Photo must be a JPEG, PNG, or GIF file",
  PHOTO_SIZE: "Photo must be less than 5MB",
} as const;

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Validation helper functions
export const validateSessionCode = (code: string): ValidationResult => {
  return {
    isValid: isValidSessionCode(code),
    error: isValidSessionCode(code) ? undefined : ValidationErrors.SESSION_CODE,
  };
};

export const validateParticipantName = (name: string): ValidationResult => {
  return {
    isValid: isValidParticipantName(name),
    error: isValidParticipantName(name)
      ? undefined
      : ValidationErrors.PARTICIPANT_NAME,
  };
};

export const validateSessionName = (name: string): ValidationResult => {
  return {
    isValid: isValidSessionName(name),
    error: isValidSessionName(name) ? undefined : ValidationErrors.SESSION_NAME,
  };
};

export const validatePhotoFile = (file: File): ValidationResult => {
  const validTypes = ["image/jpeg", "image/png", "image/gif"];

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: ValidationErrors.PHOTO_TYPE,
    };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: ValidationErrors.PHOTO_SIZE,
    };
  }

  return {
    isValid: true,
  };
};
