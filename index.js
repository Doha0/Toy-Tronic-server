const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2mmen1j.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const toyCollection = client.db('ToyDB').collection('toys');


        // -------------------Toys-----------------------

        app.get('/toys', async (req, res) => {
            if (req.query?.limit) {
                const toys = toyCollection.find().limit(parseInt(req.query?.limit));
                const result = await toys.toArray();
                res.send(result);
                return;
            }
            else {
                const toys = toyCollection.find();
                const result = await toys.toArray();
                res.send(result);
            }
        })

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);
        })


        app.get("/myToy/:id", async (req, res) => {
            const email = req.params.id;
            const filter = { seller_email: email };
            const result = await toyCollection.find(filter).toArray();
            res.send(result);
        });

        app.post('/toys', async (req, res) => {
            const toy = req.body;
            const result = await toyCollection.insertOne(toy);
            res.send(result);
        })

        app.patch('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedToys = req.body;
            // console.log(updatedToys);
            const updateToy = {
                $set: {
                    ...updatedToys
                },
            };
            const result = await toyCollection.updateOne(filter, updateToy);
            res.send(result);
        })

        // --------------search-------------

        const indexKey = { name: 1 };
        const indexOption = { name: "toyName" };
        const result = await toyCollection.createIndex(indexKey, indexOption);

        app.get("/search/:text", async (req, res) => {
            const text = req.params.text;
            const result = await toyCollection
                .find({
                    name: { $regex: text, $options: "i" },
                })
                .toArray();
            res.send(result);
        });

        // ------------------Sort----------
        app.get("/sort", async (req, res) => {
            const result = await toyCollection
                .find({ seller_email: req.query?.email })
                .sort({ price: parseInt(req.query?.sort) })
                .toArray();
            res.send(result);

        });

        // ------------------- Sub_category--------------------

        app.get("/subcategory/:id", async (req, res) => {
            const category = req.params.id;
            const filter = { sub_category: category };
            const result = await toyCollection
                .find(filter)
                .limit(2)
                .toArray();
            res.send(result);
        });

        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })









        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Toy Tronic server is running');
})

app.listen(port, () => {
    console.log(`Toy Tronic server is running on port: ${port}`);
})