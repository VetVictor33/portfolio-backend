const express = require('express');
require('dotenv').config();
const router = express();

const { MongoClient } = require('mongodb');
const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

async function main() {
    console.log('Trying to connect to the database');
    const client = await MongoClient.connect(DB_URL);
    const db = client.db(DB_NAME);
    const collection = db.collection("projects");
    console.log('Successfully connected to the database');

    router.get('/', async (req, res) => {
        const info = await collection.find().toArray();
        res.send(info)
    })

}

main();


module.exports = router;