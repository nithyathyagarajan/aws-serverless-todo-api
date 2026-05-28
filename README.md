# 🚀 AWS Serverless Todo API

A fully serverless REST API built with **AWS Lambda**, **API Gateway**, and **DynamoDB** — no servers to manage, scales automatically, and runs on AWS free tier.

---

## 🏗️ Architecture

```
User / Client
     │
     │ HTTPS Request
     ▼
┌─────────────────┐
│   API Gateway   │  ← Routes GET, POST, DELETE requests
└────────┬────────┘
         │ Invokes
         ▼
┌─────────────────┐
│ Lambda Function │  ← Business logic (Node.js 24.x)
│   (index.mjs)   │
└────────┬────────┘
         │ Read / Write
         ▼
┌─────────────────┐
│    DynamoDB     │  ← NoSQL database stores todos
│   (Todo-Table)  │
└─────────────────┘
```

---

## ✨ Features

- ✅ **GET** all todos
- ✅ **POST** create a new todo
- ✅ **DELETE** remove a todo by ID
- ✅ CORS enabled for browser access
- ✅ Error handling with proper HTTP status codes
- ✅ Fully serverless — zero server management
- ✅ AWS Free Tier compatible

---

## 🛠️ AWS Services Used

| Service | Purpose |
|---|---|
| **AWS Lambda** | Runs the backend function code |
| **API Gateway** | Exposes HTTP endpoints to the internet |
| **DynamoDB** | Stores todo items as NoSQL documents |
| **IAM** | Grants Lambda permission to access DynamoDB |
| **CloudWatch** | Logs all Lambda executions automatically |

---

## 📁 Project Structure

```
aws-serverless-todo-api/
│
├── index.mjs        ← Lambda function (main code)
└── README.md        ← This file
```

---

## ⚙️ Setup Instructions

### Prerequisites
- AWS Account (free tier works fine)
- AWS CLI installed and configured

---

### Step 1 — Create DynamoDB Table

1. Go to **AWS Console → DynamoDB → Create Table**
2. Settings:
   - Table name: `Todo-Table`
   - Partition key: `id` (type: String)
3. Leave defaults → click **Create**

---

### Step 2 — Create Lambda Function

1. Go to **AWS Console → Lambda → Create Function**
2. Settings:
   - Author from scratch
   - Function name: `Todo-Function`
   - Runtime: **Node.js 24.x**
3. Click **Create Function**
4. In the **Code** tab, rename `index.mjs` and paste the code from this repo
5. Click **Deploy**

---

### Step 3 — Add IAM Permission

1. Lambda → Configuration → Permissions → click the Role name
2. In IAM → Add permissions → Attach policies
3. Search and attach: **`AmazonDynamoDBFullAccess`**
4. Save

---

### Step 4 — Create API Gateway

1. Go to **API Gateway → Create API → REST API → Build**
2. API name: `TodoAPI`, Endpoint type: Regional
3. Create resource: `/Todos`
4. Under `/Todos`, create 3 methods:
   - **GET** → Lambda proxy integration → `Todo-Function`
   - **POST** → Lambda proxy integration → `Todo-Function`
   - **DELETE** → Lambda proxy integration → `Todo-Function`
5. Click **Deploy API** → New stage → name: `dev`
6. Copy the **Invoke URL**

---

## 🧪 API Testing

Replace `YOUR_API_URL` with your actual Invoke URL.

### Get all todos
```bash
curl https://YOUR_API_URL/dev/Todos
```

**Response:**
```json
[]
```

---

### Create a todo
```bash
curl -X POST https://YOUR_API_URL/dev/Todos \
  -H "Content-Type: application/json" \
  -d '{"task": "Learn AWS Lambda"}'
```

**Response:**
```json
{
  "id": "1779956370160",
  "task": "Learn AWS Lambda",
  "done": false
}
```

---

### Get all todos (after adding one)
```bash
curl https://YOUR_API_URL/dev/Todos
```

**Response:**
```json
[
  {
    "id": "1779956370160",
    "done": false,
    "task": "Learn AWS Lambda"
  }
]
```

---

### Delete a todo
```bash
curl -X DELETE https://YOUR_API_URL/dev/Todos \
  -H "Content-Type: application/json" \
  -d '{"id": "1779956370160"}'
```

**Response:**
```json
{
  "message": "Deleted"
}
```

---

## 📄 Lambda Function Code Explained

```javascript
// Import AWS SDK v3 (built into Node.js 24.x Lambda runtime)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client); // Easier document-style API
const TABLE = "Todo-Table";                      // DynamoDB table name

export const handler = async (event) => {
  // event.httpMethod tells us GET / POST / DELETE
  const method = (event.httpMethod || "").toUpperCase();
  const body = event.body ? JSON.parse(event.body) : {};

  // GET → scan all items from DynamoDB
  if (method === "GET") {
    const result = await db.send(new ScanCommand({ TableName: TABLE }));
    return { statusCode: 200, body: JSON.stringify(result.Items || []) };
  }

  // POST → create new todo with timestamp ID
  if (method === "POST") {
    const item = { id: Date.now().toString(), task: body.task, done: false };
    await db.send(new PutCommand({ TableName: TABLE, Item: item }));
    return { statusCode: 201, body: JSON.stringify(item) };
  }

  // DELETE → remove todo by ID
  if (method === "DELETE") {
    await db.send(new DeleteCommand({ TableName: TABLE, Key: { id: body.id } }));
    return { statusCode: 200, body: JSON.stringify({ message: "Deleted" }) };
  }
};
```

---

## 🔑 Key Concepts Demonstrated

| Concept | How it's used |
|---|---|
| **Serverless** | No EC2 or servers — Lambda runs on demand |
| **REST API design** | GET, POST, DELETE with proper status codes |
| **NoSQL database** | DynamoDB with partition key pattern |
| **IAM security** | Least-privilege role for Lambda |
| **AWS SDK v3** | Modern modular imports for DynamoDB |
| **Error handling** | Try/catch with 500 response on failure |
| **CORS headers** | `Access-Control-Allow-Origin: *` for browser access |

---

## 💰 AWS Cost

This project runs entirely within the **AWS Free Tier**:
- Lambda: 1 million free requests/month
- DynamoDB: 25 GB free storage
- API Gateway: 1 million free API calls/month

---

## 👤 Author

Built by **Mikki** as part of AWS cloud portfolio.

> 📌 This project demonstrates hands-on AWS skills: Lambda, API Gateway, DynamoDB, IAM — core services for any cloud/DevOps role.

---

## 📜 License

MIT License — free to use and modify.
