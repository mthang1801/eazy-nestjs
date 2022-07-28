export const findSourceRaiseError = (pathName) => {
  if (new RegExp(process.env.WEB_DOMAIN, 'gi').test(pathName)) return 'Website';
  if (new RegExp(process.env.CORE_API, 'gi').test(pathName)) return 'Appcore';
  if (new RegExp(process.env.CMS_URL, 'gi').test(pathName)) return 'CMS';
  return 'API';
};

export const statusCodes = {
  success: {
    OK: 200,
    Created: 201,
    Accepted: 202,
    'Non-Authoritative-Information': 203,
    'No-Content': 204,
  },
  redirect: {
    'Moved-Permanently': 301,
    'Temporarily-Permanently': 302,
  },
  fail: {
    'Bad Request': 400,
    Unauthorized: 401,
    Forbidden: 403,
    'Not-Found': 404,
    'Method-Not-Allowed': 405,
    'Request Timeout': 408,
    Conflict: 409,
    'Payload-Too-Large': 413,
    'URI-Too-Long': 414,
    'Unprocessable-Entity': 422,
    'Too-Many-Request': 429,
    'Request-Header-Fields-Too-Large': 431,
    'Internal-Server-Error': 500,
    'Bad-Gateway': 502,
    'Service-Unavailable': 503,
    'Gateway-Timeout': 504,
  },
};
