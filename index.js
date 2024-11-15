const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a4fxe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Connect to the "dataDB" database and access its "data" collection
    const spotCollection = client.db("spotsDB").collection("spots");
    const userCollection = client.db("spotsDB").collection("user");

    // GET route to retrieve all data
    app.get("/spots", async (req, res) => {
      console.log("get");
      console.log(req.query);
      const email = req.query.email;
      if (email) {
        const cursor = spotCollection.find({ user_email: email });
        const result = await cursor.toArray();
        res.send(result);
        return;
      }
      const cursor = spotCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // POST route to add a new data
    app.post("/spots", async (req, res) => {
      const newSpot = req.body;
      console.log(newSpot);
      const result = await spotCollection.insertOne(newSpot);
      res.send(result);
    });

    // getting specific id
    app.get("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.findOne(query);
      res.send(result);
    });

    // Update operation
    app.get("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.findOne(query);
      res.send(result);
    });

    // edit operation
    app.put("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const spot = req.body;
      console.log(spot);
      const updatedSpot = {
        $set: {
          tourists_spot_name: spot.tourists_spot_name,
          country_name: spot.country_name,
          location: spot.location,
          short_description: spot.short_description,
          average_cost: spot.average_cost,
          seasonality: spot.seasonality,
          image: spot.image,
          travel_time: spot.travel_time,
          total_visitors_per_year: spot.total_visitors_per_year,
          user_email: spot.user_email,
          user_name: spot.user_name,
        },
      };

      const result = await spotCollection.updateOne(
        filter,
        updatedSpot,
        option
      );
      res.send(result);
    });

    // delete operation
    app.delete("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotCollection.deleteOne(query);
      res.send(result);
    });

    // user related APIs

    // (2) GET route to retrieve all data
    app.get("/user", async (req, res) => {
      console.log("get");
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // (1) POST route to add a new data
    app.post("/user", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // (4) edit operation
    app.patch("/user", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      console.log(user);
      const updatedUser = {
        $set: {
          lastLoggedAt: user.lastLoggedAt,
        },
      };

      const result = await userCollection.updateOne(filter, updatedUser);
      res.send(result);
    });

    // (3) delete operation
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("peace finder server is running");
});

app.listen(port, () => {
  console.log(`peace finder server is running ON PORT, ${port}`);
});
