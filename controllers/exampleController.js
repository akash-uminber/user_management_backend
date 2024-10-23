const ExampleModel = require('../models/exampleModel');

exports.getHello = (req, res) => {
  const message = ExampleModel.getHelloMessage();
  res.json({ message });
};
