const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.User_Name}:${process.env.User_Pass}@cluster0.eihnvmx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect;

    const toolsCollection = client.db("tools").collection("all-tools");
    const userReviewCollection = client.db("tools").collection("userReview");
    const ordersCollection = client.db("Orders").collection("myOrders");

    //
    app.get("/allTools", async (req, res) => {
      const query = {};
      const cursor = await toolsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //
    app.get("/allTools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await toolsCollection.findOne(query);
      res.send(result);
    });

    //
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    //
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { customerEmail: email };
      const cursor = await ordersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //
    app.post("/review", async (req, res) => {
      const order = req.body;
      const result = await userReviewCollection.insertOne(order);
      res.send(result);
    });

    //
    app.post("/review", async (req, res) => {
      const query = {};
      const cursor = await userReviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
