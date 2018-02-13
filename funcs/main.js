'use strict';

const body = `
<html>
  <body>
    <h1>Hi!</h1>
    <form method="POST" action="">
      <p>
        <label for="uri">Link:</label>
        <input type="text" id="link" name="link" size="40" autofocus />
      </p>
      <input type="submit" value="Shorten it!" />
    </form>
  </body>
</html>
`;

module.exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event));
  callback(null, {
    statusCode: 200,
    body,
    headers: { 'Content-Type': 'text/html' },
  });
};
