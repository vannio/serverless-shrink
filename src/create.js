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

    return callback(null, {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message })
    });
  }

  const url = body.url;
  const slug = crypto.createHash('sha256')
    .update(url)
    .digest('hex')
    .substring(0, 6);
  const shrink = path.join(rootPath, slug).replace(':/', '://');

  return documentClient.put({
    TableName: tableName,
    Item: {
      url,
      slug
    },
    Expected: {
      url: { Exists: false },
    }
  })
  .promise()
  .then(() => {
    console.log('SHRUNK', `${url} -> ${shrink}`);

    return callback(null, {
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
    if (error.code === 'ConditionalCheckFailedException') {
      return callback(null, {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Already exists',
          data: {
            url,
            shrink
          }
        })
      });
    }

    const body = JSON.stringify(error);
    console.log('ERROR', body);

    return callback(null, {
      statusCode: 500,
      headers,
      body
    });
  });
};
