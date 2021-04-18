const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const ObjectID = require('mongodb').ObjectID
const MongoClient = require('mongodb').MongoClient;
const app = express()
const port = 5000;
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tyr4y.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const serviceCollection = client.db(process.env.DB_NAME).collection('services');
  const orderCollection = client.db(process.env.DB_NAME).collection('orders');
  const reviewCollection = client.db(process.env.DB_NAME).collection('reviews');
  const adminCollection = client.db(process.env.DB_NAME).collection('admins');
  app.post('/addService', (req, res) => {
    const serviceData = req.body;
    serviceCollection.insertOne(serviceData)
      .then(result => {
        res.send(result);
      })
  })

  app.get('/services', (req, res) => {
    serviceCollection.find({})
      .toArray((err, doc) => {
        res.send(doc);
      })
  })

  app.post('/addAdmin', (req, res) => {
    const adminEmail = req.body.email;
    adminCollection.insertOne({ adminEmail })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })



  app.post('/confirmOrder', (req, res) => {
    const orderDetails = req.body;

    orderCollection.insertOne(orderDetails)
      .then(result => {
        res.send(result.insertedCount > 0)
        console.log('data inserted', result.insertedCount);
      })

  })

  app.post('/orders', (req, res) => {
    const userEmail = req.body.email;

    adminCollection.find({ adminEmail: userEmail })
      .toArray((err, admin) => {
        if (admin.length !== 0) {
          orderCollection.find({})
            .toArray((error, allOrders) => {
              res.send(allOrders)

            })
        } else {
          orderCollection.find({ email: userEmail })
            .toArray((err, order) => {
              res.send(order)

            })
        }
      })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ adminEmail: email })
      .toArray((err, isAdmin) => {
        if (isAdmin.length !== 0) {
          res.send(isAdmin);

        }
      })
  })

  app.post('/addReview', (req, res) => {
    const data = req.body;
    reviewCollection.insertOne(data)
      .then(result => {
        res.send(result.insertedCount > 0);
      })

  })
  app.get('/reviews', (req, res) => {
    reviewCollection.find({})
      .toArray((error, document) => {
        res.send(document);
      })
  })

  err ? console.log(err) : console.log('DB connected successfully');
})

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(process.env.PORT || port, () => {
  console.log(`server is running at ${port}`);
})