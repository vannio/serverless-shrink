'use strict';

module.exports.handler = (event, _context, callback) => {
  console.log('EVENT', JSON.stringify(event));
  return callback(null, {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: 'OK'
  });
};
