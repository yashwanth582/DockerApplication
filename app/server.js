 
let express = require('express');
let path = require('path');
let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let app = express();
let cors = require('cors')
app.use('/images', express.static(path.join(__dirname, '/images')))

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
 
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images/profile-1 (1).jpg"));
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// use when starting application locally
let mongoUrlLocal = 'mongodb://admin:password@localhost:27017';

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@mongodb";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "user-account";

 

app.post('/update-profile', async function (req, res) {
  let userObj = req.body;

  console.log(userObj);

  try {
    const client = await MongoClient.connect(mongoUrlDocker, mongoClientOptions);
    console.log("Connected to MongoDB!");

    const db = client.db(databaseName);
    

    userObj['userid'] = 1;
     

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    await db.collection("users").updateOne(myquery, newvalues, { upsert: true });

    console.log("Successfully updated!");
    client.close();

    // Send response
    res.send(userObj);
  } catch (err) {
    console.error('Error connecting to MongoDB or updating profile:', err);
    res.status(500).send({ error: 'An error occurred while updating the profile.' });
  }
});

 

app.get('/get-profile', async function (req, res) {
  try {
    const client = await MongoClient.connect(mongoUrlDocker, mongoClientOptions);
    console.log("Connected to MongoDB!");

    const db = client.db(databaseName);
     

    const myquery = { userid: 1 };

    const result = await db.collection("users").findOne(myquery);

    console.log("Profile retrieved:", result);
    client.close();

    // Send response
    res.send(result || {});
  } catch (err) {
    console.error('Error connecting to MongoDB or fetching profile:', err);
    res.status(500).send({ error: 'An error occurred while fetching the profile.' });
  }
});


app.listen(3000, function () {
  console.log("app listening on port 3000!");
});

