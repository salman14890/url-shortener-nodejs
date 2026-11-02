import "dotenv/config";

import { DynamoDBClient, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const db = DynamoDBDocumentClient.from(client);
export const tableName = process.env.DYNAMODB_TABLE;

export async function checkConnection() {
  const result = await client.send(
      new DescribeTableCommand({ TableName: tableName })
  );
  return result.Table.TableStatus;
}