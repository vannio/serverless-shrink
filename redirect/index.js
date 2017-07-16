'use strict';

module.exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event));
  const slug = event.pathParameters.slug;
  const target = process.env['URL_' + slug.toUpperCase()] || 'https://serverless.com/framework/docs/';
  callback(
    null,
    {
      statusCode: 302,
      body: target,
      headers: {
        'Location': target,
        'Content-Type': 'text/plain',
      },
    }
  );
}
