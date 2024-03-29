import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { shortenURL } from "./create";
import { getRedirectURL } from "./redirect";

export type HandlerResponse<T> = {
  statusCode: number;
  data?: T;
  error?: { message: string };
};

export const config = {
  rootPath: `https://${process.env.ROOT_PATH}`,
  tableName: process.env.DDB_Table!,
} as const;

const logJSON = (event: string, payload: any) =>
  console.log(event, JSON.stringify(payload));

export const health = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logJSON("EVENT", event);

  return {
    statusCode: 200,
    body: "OK",
  };
};

export const create = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logJSON("EVENT", event);
  const { statusCode, ...res } = await shortenURL(event);
  if (!res.error) {
    logJSON("SHRUNK", res.data);
  } else {
    logJSON("ERROR", res.error);
  }
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(res),
  };
};

export const redirect = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logJSON("EVENT", event);

  const { statusCode, ...res } = await getRedirectURL(event);
  if (res.data?.location) {
    logJSON("REDIRECT", res.data);
    return {
      statusCode,
      headers: {
        Location: res.data.location,
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(res),
    };
  }

  logJSON("ERROR", res);
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(res),
  };
};
