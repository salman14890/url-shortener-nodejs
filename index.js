import "dotenv/config";
import express from "express";
import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { shortUrlSchema } from "./schemas/short-url.js";
import { db, tableName, checkConnection } from "./db.js";
import { nanoid } from "nanoid";

// Check if the DynamoDB table exists and validate the connection
checkConnection()
    .then((status) => console.log("DynamoDB table status:", status))
    .catch((error) => console.error("DynamoDB connection failed:", error.message));

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/short-url", async (req, res) => {

    const validation = shortUrlSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            message: validation.error.issues[0].message
        });
    }
    
    const { url } = req.body;
    const code = nanoid(7);
    await db.send(
        new PutCommand({
            TableName: tableName,
            Item: {
                code,
                originalUrl: url,
                clicks: 0,
                createdAt: new Date().toISOString(),
            }
        })
    );
    
    res.status(201).json({
        code,
        shortUrl:  `${req.protocol}://${req.get("host")}/${code}`
    })
    
});

// redirect
app.get("/:code"
    , async (req, res) => {
    const { Item } = await db.send(
    new GetCommand({ TableName: tableName, Key: { code: req.params.code } })
    );
    if (!Item) return res.status(404).json({ error: "Not found" });

    await db.send(
    new UpdateCommand({
        TableName: tableName,
        Key: { code: req.params.code },
        UpdateExpression: "SET clicks = clicks + :one",
        ExpressionAttributeValues: { ":one": 1 }
    })
    );
    res.redirect(Item.originalUrl);
    });

// stats
app.get("/stats/:code"
    , async (req, res) => {
    const { Item } = await db.send(
    new GetCommand({ TableName: tableName, Key: { code: req.params.code } })
    );
    if (!Item) return res.status(404).json({ error: "Not found" });
    res.json(Item);
    });

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
    });

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});