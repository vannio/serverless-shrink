import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { createHash } from "crypto";

import { HandlerResponse, config } from ".";

const createSlug = (url: string) =>
  createHash("sha256").update(url, "utf8").digest("hex").substring(0, 6);

const createURL = (slug: string) => new URL(slug, config.rootPath).href;

const insertSlug = async (url: string, slug: string) => {
  const ddb = new DynamoDB.DocumentClient();
  return ddb
    .put({
      TableName: config.tableName,
      Item: { url, slug },
      Expected: {
        url: { Exists: false },
      },
    })
    .promise();
};

export const shortenURL = async (
  event: APIGatewayProxyEvent
): Promise<HandlerResponse<{ url: string; shrink: string }>> => {
  if (!event || !event.body) {
    return {
      statusCode: 400,
      error: {
        message: "No URL submitted",
      },
    };
  }

  const url: string = JSON.parse(event.body).url;
  const slug = createSlug(url);
  const shrink = createURL(slug);

  try {
    await insertSlug(url, slug);
  } catch(e) {
    if (e.code !== 'ConditionalCheckFailedException') {
      // url/slug combo already exists
      throw e;
    }
  }

  return {
    statusCode: 200,
    data: { url, shrink },
  };
};
