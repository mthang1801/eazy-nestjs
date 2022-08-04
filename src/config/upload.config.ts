export default (): Record<string, any> => ({
  cdnUrl: process.env.CDN_URL,
  cdnSecurityUploadUrl: process.env.CDN_UPLOAD_AUTH_UUID,
  uploadAPI: process.env.CDN_UPLOAD_URL,
});
