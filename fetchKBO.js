const fh = require('./modules/fetchHelper');

const date = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
console.log(date)