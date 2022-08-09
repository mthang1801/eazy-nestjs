import { RequestMethod } from '@nestjs/common';
export default (): Record<string, any> => ({
  port: parseInt(process.env.PORT, 10),
  bcryptSalt: parseInt(process.env.BCRYPT_SALT, 10),
  apiPrefix: process.env.GLOBAL_PREFIX || 'api',
  exludeGlobalPrefix: [
    { path: 'uploads', method: RequestMethod.ALL },
    { path: '/', method: RequestMethod.GET },
  ],
  whiteListCORS: process.env.WHITE_LIST_CORS.split(','),
  enableVersioning: ['3', '2', '1'],
});
