'use strict';

const AWS = require('aws-sdk');
const tableName = process.env.DDB_Table;
const documentClient = new AWS.DynamoDB.DocumentClient();
const headers = { 'Content-Type': 'application/json' };

module.exports.handler = (event, context, callback) => {
  console.log('EVENT', JSON.stringify(event));
  const slug = event.pathParameters.slug;
  documentClient.get({
    TableName: tableName,
    Key: { slug },
  }, (error, data) => {
    if (error) {
      const message = JSON.stringify(error);
      console.log('ERROR', message);
      return callback(null, {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message }),
      });
    }
    const item = data.Item;
    if (item && item.url) {
      callback(null, {
        statusCode: 302,
        headers: {
          Location: item.url,
          'Content-Type': 'text/plain',
        },
        body: item.url
      });
    } else {
      callback(null, {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'URL not found' }),
      });
    }
  });
};
