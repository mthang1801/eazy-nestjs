export default (): Record<string, any> => ({
  mailPort: +process.env.EMAIL_PORT || 465,
  mailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  mailUser: process.env.EMAIL_USER || '',
  mailPass: process.env.EMAIL_PASS || '',
});
