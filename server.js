const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();

const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI || 'mongodb+srv://irfanburak2000:bX4ZRWAqh4Vf5olI@cluster0.veusa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.DB_NAME || 'card_game_tutorial';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/secret', (req, res) => res.sendFile(path.join(__dirname, 'secret.html')));

app.post('/secret', async (req, res) => {
    let client;
    try {
        client = await MongoClient.connect(uri);
        console.log('Connected successfully to MongoDB');

        const db = client.db(DB_NAME);
        const collection = db.collection('names');

        const entry = {
            name: req.body.name.toLowerCase(),
            card: `${req.body.number}_of_${req.body.suit}`
        };

        // Insert the document
        const result = await collection.insertOne(entry);
        console.log('Document inserted:', result.insertedId);

        res.send('successfully posted data to database');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('An error occurred');
    } finally {
        if (client) {
            await client.close();
        }
    }
});

app.get('/:name', async (req, res) => {
    let client;
    try {
        client = await MongoClient.connect(uri);
        console.log('Connected successfully to MongoDB');

        const db = client.db(DB_NAME);
        const collection = db.collection('names');
        const name = req.params.name.toLowerCase();

        if (name === 'deleteall') {
            await collection.deleteMany({});
            res.send('All data deleted');
        } else {
            const result = await collection.findOne({ name }); 
            if (!result) {
                res.status(404).send('Name not found');
                return;
            }
            res.sendFile(path.join(__dirname, '/cards/', `${result.card}.png`)); 
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('An error occurred');
    } finally {
        if (client) {
            await client.close(); 
        }
    }
});
 

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
