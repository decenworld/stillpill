const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.get('/.netlify/functions/server', (req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Add any other routes you need here

module.exports.handler = serverless(app);
