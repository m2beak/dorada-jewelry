// Security Service - Hidden Admin Access
// This file contains the secret access mechanism for the admin panel

// SECRET KEY - Only you should know this!
// Change this to your own secret key
const ADMIN_SECRET_KEY = 'dorada2024_secure_admin_access';

// Check if admin access is granted
export const hasAdminAccess = (): boolean => {
  try {
    const access = localStorage.getItem('dorada_admin_access');
    if (!access) return false;
    
    const data = JSON.parse(access);
    // Check if access is still valid (24 hours)
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem('dorada_admin_access');
      return false;
    }
    return data.granted === true && data.key === ADMIN_SECRET_KEY;
  } catch {
    return false;
  }
};

// Grant admin access with secret key
export const grantAdminAccess = (secretKey: string): { success: boolean; error?: string } => {
  if (secretKey.trim() !== ADMIN_SECRET_KEY) {
    return { success: false, error: 'مفتاح غير صحيح' };
  }
  
  const accessData = {
    granted: true,
    key: ADMIN_SECRET_KEY,
    grantedAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };
  
  localStorage.setItem('dorada_admin_access', JSON.stringify(accessData));
  return { success: true };
};

// Revoke admin access
export const revokeAdminAccess = (): void => {
  localStorage.removeItem('dorada_admin_access');
};

// Validate admin session
export const validateAdminSession = (): boolean => {
  return hasAdminAccess();
};
