// In-memory OTP storage (for production, use Redis or database)
const otpStore = new Map();

// Store OTP with expiration (10 minutes)
export const storeOTP = (identifier, otp) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(identifier, { otp, expiresAt });
  
  // Auto-cleanup after expiration
  setTimeout(() => {
    otpStore.delete(identifier);
  }, 10 * 60 * 1000);
};

// Verify OTP
export const verifyOTP = (identifier, otp) => {
  const stored = otpStore.get(identifier);
  
  if (!stored) {
    return { valid: false, error: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(identifier);
    return { valid: false, error: 'OTP has expired' };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, error: 'Invalid OTP' };
  }
  
  // OTP is valid, remove it
  otpStore.delete(identifier);
  return { valid: true };
};

// Clear OTP
export const clearOTP = (identifier) => {
  otpStore.delete(identifier);
};
