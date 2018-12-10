const express = require('express');

const app = express();
const PORT = 8081;

let counter = 0;

app.get('/counter', (req, res) => {
  res.send({ counter });
});

app.put('/counter', (req, res) => {
  counter += 1;
  res.send({ counter });
});

app.listen(PORT, () => console.log(`app listening on port ${PORT}!`));
