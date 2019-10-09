const DEV = 'development';
const { NODE_ENV } = process.env;
const ENV = NODE_ENV || DEV;
module.exports = {
  ENV,
  DEV,
};
