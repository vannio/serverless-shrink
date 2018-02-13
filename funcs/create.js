'use strict';

const path = require('path');
const crypto = require('crypto');
const AWS = require('aws-sdk');
AWS.config.setPromisesDependency(Promise);

const documentClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DDB_Table;
const rootPath = process.env.ROOT_PATH;
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
  const slug =  crypto.randomBytes(8)
    .toString('base64')
    .replace(/[=+/]/g, '')
    .substring(0, 4);

  documentClient.put({
    TableName: tableName,
    Item: {
      url,
      slug,
    },
    Expected: {
      url: { Exists: false },
    },
  })
  .promise()
  .then(() => {
    const shrink = path.join(rootPath, slug).replace(':/', '://');
    console.log('SHRUNK', `${url} -> ${shrink}`);

    callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Success',
        data: {
          url,
          shrink
        }
      })
    })
  })
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
