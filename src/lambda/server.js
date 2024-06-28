// src/lambda/server.js
const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "Hello from the server!" });
});

app.get('/about', (req, res) => {
  res.json({ message: "This is the about page" });
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  res.json({ message: `Thank you ${name} for your message!` });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports.handler = serverless(app);
