export const getURL = (): string => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};