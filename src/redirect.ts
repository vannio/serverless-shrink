import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import { HandlerResponse, config } from ".";

const fetchRedirect = async (slug: string): Promise<string | undefined> => {
  const ddb = new DynamoDB.DocumentClient();
  const data = await ddb
    .get({
      TableName: config.tableName,
      Key: { slug },
    })
    .promise();

  return data.Item?.url;
};

export const getRedirectURL = async (
  event: APIGatewayProxyEvent
): Promise<HandlerResponse<{ location: string }>> => {
  const slug = event.pathParameters!.slug!;
  const location = await fetchRedirect(slug);

  if (location) {
    return {
      statusCode: 302,
      data: { location }
    }
  }

  return {
    statusCode: 404,
    error: {
      message: `Cannot find shortened URL for ${event.path}`
    }
  }
};
