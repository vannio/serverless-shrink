'use strict';

const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(Promise);

const documentClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DDB_Table;
const headers = { 'Content-Type': 'application/json' };

module.exports.handler = (event, context, callback) => {
  console.log('EVENT', JSON.stringify(event));
  const slug = event.pathParameters.slug;

  return documentClient.get({
    TableName: tableName,
    Key: { slug }
  })
  .promise()
  .then(data => {
    const item = data.Item;

    if (item && item.url) {
      console.log('REDIRECT', `${event.path} -> ${item.url}`);

      return callback(null, {
        statusCode: 302,
        headers: {
          Location: item.url,
          'Content-Type': 'text/plain',
        },
        body: item.url
      });
    }

    const message = `Cannot find shortened URL for ${event.path}`;
    console.log('ERROR', message);

    return callback(null, {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message })
    });
  })
  .catch(error => {
    const body = JSON.stringify(error);
    console.log('ERROR', body);

    return callback(null, {
      statusCode: 500,
      headers,
      body
    });
  });
};
