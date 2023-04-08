const express = require('express');
const router = require('./router');
require('dotenv').config();


const app = express();
app.use(express.json());
async () => app.use(router);

app.listen(process.env.PORT || process.env.CYCLIC_URL);
