const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

const stripe = require("stripe")(process.env.Stripe_Secret);

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

    const userCollection = client.db("AllUsers").collection("users");

    //--------------------------------------------------------

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
    app.delete("/toolDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await toolsCollection.deleteOne(query);
      res.send(result);
    });

    //
    app.post("/tools", async (req, res) => {
      const order = req.body;
      const result = await toolsCollection.insertOne(order);
      res.send(result);
    });

    //-----------------------------------------------------

    //
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    //
    app.get("/allOrders", async (req, res) => {
      const query = {};
      const cursor = await ordersCollection.find(query);
      const result = await cursor.toArray();
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
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });

    //
    app.get("/getOrder/:orderId", async (req, res) => {
      const id = req.params.orderId;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query);
      res.send(result);
    });

    //
    app.post("/payment", async (req, res) => {
      const product = req.body;
      const price = product.price;
      const amount = parseInt(price) * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });

    // user payment status update his orders
    app.patch("/paymentUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const payment = req.body;
      const updateDoc = {
        $set: {
          paid: true,
          paymentInfo: payment,
        },
      };
      // const result = await myOrderCollection.insertOne(payment);
      const updateOrder = await ordersCollection.updateOne(filter, updateDoc);
      res.send({ updateOrder });
    });

    // user payment status update his orders
    app.patch("/orderCancel/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const payment = req.body;
      const updateDoc = {
        $set: {
          orderCancel: true,
        },
      };
      // const result = await myOrderCollection.insertOne(payment);
      const updateOrder = await ordersCollection.updateOne(filter, updateDoc);
      res.send({ updateOrder });
    });

    //---------------------------------------------------------------

    //
    app.post("/review", async (req, res) => {
      const order = req.body;
      const result = await userReviewCollection.insertOne(order);
      res.send(result);
    });

    //
    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = await userReviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //
    app.get("/reviews/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const cursor = await userReviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //-------------------------------------------------------

    //
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);

      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      res.send({ result, status: 200, success: true, accessToken: token });
    });

    //
    app.put("/UpdateProfile/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);

      res.send({
        result,
        status: 200,
        success: true,
      });
    });

    //
    app.get("/allUsers", async (req, res) => {
      const query = {};
      const cursor = await userCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //
    app.get("/adminUser/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    //
    app.delete("/removeUser/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // MAke Admin
    app.patch("/makeAdmin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const payment = req.body;
      const updateDoc = {
        $set: {
          Role: "Admin",
        },
      };
      // const result = await myOrderCollection.insertOne(payment);
      const updateOrder = await userCollection.updateOne(filter, updateDoc);
      res.send({ success: true, result: updateOrder });
    });

    // MAke Admin
    app.patch("/removeAdmin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const payment = req.body;
      const updateDoc = {
        $set: {
          Role: null,
        },
      };
      const updateOrder = await userCollection.updateOne(filter, updateDoc);
      res.send({ success: true, result: updateOrder });
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
