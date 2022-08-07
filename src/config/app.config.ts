import { RequestMethod } from '@nestjs/common';

export default (): Record<string, any> => ({
  port: parseInt(process.env.PORT, 10),
  bcryptSalt: parseInt(process.env.BCRYPT_SALT, 10),
  apiPrefix: 'api',
  exludeGlobalPrefix: [{ path: 'uploads', method: RequestMethod.POST }],
  whiteListCORS: process.env.WHITE_LIST_CORS.split(','),
  enableVersioning: ['2', '1'],
});
