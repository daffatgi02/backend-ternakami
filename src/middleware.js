const bodyParser = require("body-parser");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const app = express();

const middleware = (app) => {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(fileUpload());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
};

module.exports = middleware;
