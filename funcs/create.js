'use strict';

const AWS = require('aws-sdk');
const querystring = require('querystring');
const path = require('path');
const crypto = require('crypto');
AWS.config.setPromisesDependency(Promise);

const tableName = process.env.DDB_Table;
const docClient = new AWS.DynamoDB.DocumentClient();

const render = (link, submitted) => `
<html>
  <body>
    <h3><a href="${link}">${link}</a></h3>
    <p>URL ${submitted} was shortened to: <a href="${link}">${link}</a></p>
  </body>
</html>
`;

module.exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event));
  const submitted = querystring.parse(event.body).link;
  const prefix = event.headers.Referer || 'http://vann.io/';
  console.log(`URL submitted: ${submitted}`);
  return new Promise((resolve, reject) => {
    resolve(
      crypto.randomBytes(8)
        .toString('base64')
        // take out chars that mean something in URLs
        .replace(/[=+/]/g, '')
        // 4 chars gives us 14776336 options
        .substring(0, 4)
    )
  })
    .then(slug => {
      console.log(`Trying to save URL: ${submitted}, slug: ${slug}`);
      return docClient
        .put({
          TableName: tableName,
          Item: {
            slug,
            url: submitted,
          },
          Expected: {
            url: { Exists: false },
          },
        })
        .promise()
        .then(() => slug);
    })
    .then(slug => {
      console.log('Success');
      const link = path.join(prefix, slug).replace(':/', '://');
      return callback(null, {
        statusCode: 200,
        body: render(link, prefix),
        headers: { 'Content-Type': 'text/html' },
      });
    })
    .catch(error => {
      console.log(`Oh no, hit an error! ${error}`);
      callback(null, {
        statusCode: 400,
        body: 'Something went wrong, please try again',
      });
    });
};
