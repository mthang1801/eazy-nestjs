export const convertToMySQLDateTime = (DateTime = new Date()) =>
  new Date(new Date(DateTime).getTime() + 7 * 3600 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

export const preprocessUserResult = (user) => {
  if (!user) return null;
  if (typeof user == 'object' && Array.isArray(user)) {
    let users = [];
    user.forEach((item) => {
      let userObject = { ...item };
      delete userObject.password;
      delete userObject.salt;
      users.push(userObject);
    });
    return users;
  }
  let userObject = { ...user };
  delete userObject.password;
  delete userObject.salt;
  return userObject;
};

export const generateOTPDigits = () =>
  Math.floor(100000 + Math.random() * 900000);

export const preprocessDatabaseBeforeResponse = (data) => {
  if (!data || (typeof data === 'object' && !Object.entries(data).length)) {
    return null;
  }
  let dataObject = { ...data };
  if (dataObject['created_at']) {
    dataObject['created_at'] = convertToMySQLDateTime(
      new Date(dataObject['created_at']),
    );
  }
  if (dataObject['updated_at']) {
    dataObject['updated_at'] = convertToMySQLDateTime(
      new Date(dataObject['updated_at']),
    );
  }
  return dataObject;
};

export function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}
