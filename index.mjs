import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);
const TABLE = "Todo-Table";

export const handler = async (event) => {
  console.log("Event received:", JSON.stringify(event));

  // Normalize the method to uppercase just in case
  const method = (event.httpMethod || "").toUpperCase();
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    // GET - fetch all todos
    if (method === "GET" || event.requestContext?.http?.method === "GET") {
      const result = await db.send(new ScanCommand({ TableName: TABLE }));
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(result.Items || [])
      };
    }

    // POST - create todo
    if (method === "POST") {
      const item = { id: Date.now().toString(), task: body.task, done: false };
      await db.send(new PutCommand({ TableName: TABLE, Item: item }));
      return {
        statusCode: 201,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      };
    }

    // DELETE - remove todo
    if (method === "DELETE") {
      await db.send(new DeleteCommand({ TableName: TABLE, Key: { id: body.id } }));
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Deleted" })
      };
    }

    // Default fallback
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Method ${method} not handled.` })
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
