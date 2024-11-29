const ExampleModel = require('../models/exampleModel');

exports.getHello = (req, res) => {
  res.json({ message: "Hello from the API!" });
};
