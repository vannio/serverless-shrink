'use strict';

const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(Promise);

const path = require('path');
const crypto = require('crypto');
const tableName = process.env.DDB_Table;
const documentClient = new AWS.DynamoDB.DocumentClient();
const headers = { 'Content-Type': 'application/json' };

module.exports.handler = (event, context, callback) => {
  console.log('EVENT', JSON.stringify(event));
  const body = JSON.parse(event.body);
  if (!body || !body.url) {
    const message = 'No URL submitted';
    console.log('ERROR', message);
    callback(null, {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message }),
    });
  }
  const url = body.url;
  return new Promise((resolve) => {
    resolve(
      crypto.randomBytes(8)
        .toString('base64')
        .replace(/[=+/]/g, '')
        .substring(0, 4)
    );
  })
  .then(slug => (
    documentClient.put({
      TableName: tableName,
      Item: {
        slug,
        url,
      },
      Expected: {
        url: { Exists: false },
      },
    }))
    .promise()
    .then(() => slug)
  )
  .then(slug =>
    callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Success',
        data: {
          url,
          shrink: path.join(process.env.ROOT_PATH, slug).replace(':/', '://')
        }
      }),
    })
  )
  .catch(error => {
    const message = JSON.stringify(error);
    console.log('ERROR', message);
    callback(null, {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message }),
    });
  });
};
