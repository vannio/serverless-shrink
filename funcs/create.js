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
    console.log(`ERROR No URL submitted`);
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: `No URL submitted` }),
      headers,
    });
  }
  const url = body.url;
  const prefix = event.headers.Referer;
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
      body: JSON.stringify({
        message: 'Success',
        data: {
          url,
          shrink: path.join(prefix, slug).replace(':/', '://')
        }
      }),
      headers,
    })
  )
  .catch(error => {
    console.log(`ERROR ${error}`);
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
      headers,
    });
  });
};
