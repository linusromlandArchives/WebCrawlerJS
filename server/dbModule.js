const mongoose = require("mongoose"),
  ObjectID = require("mongodb").ObjectID;
let db;

//Connect to MongoDB With Authentication.
exports.cnctDBAuth = (collectionname) => {
  const mongAuth = require("./mongoauth.json");
  mongoose.connect("mongodb://localhost:27017/" + collectionname, {
    auth: {
      authSource: "admin",
    },
    user: mongAuth.username,
    pass: mongAuth.pass,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("Connected to MongoDB using collection " + collectionname);
  });
};

//Connect to MongoDB
exports.cnctDB = (collectionname) => {
  let dbLink = `mongodb://localhost/${collectionname}`;
  mongoose.connect(dbLink, { useNewUrlParser: true, useUnifiedTopology: true });

  db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("Connected to MongoDB using " + collectionname);
  });
};

exports.findInDBOne = async (Model) => {
  return await Model.findOne();
};

exports.searchInDBOne = async (Model, link) => {
  return await Model.findOne({ link: link });
};

exports.findInDB = async (Model) => {
  return await Model.find({});
};

//takes input with type Model. Saves that model in Database. Cant be used before cnctDB or cnctDBAuth.
exports.saveToDB = (input) => {
  input.save(() => {});
};

exports.getUnvisited = async (Model) => {
  return await Model.findOne({ visited: false });
};

exports.getLength = async (Model) => {
  /*let tmp = await Model.find();
  return await tmp.length;*/
  return "N/A";
};

exports.visit = async (Model, link) => {
  await Model.updateOne({ link: link }, { $set: { visited: true } });
};

exports.hit = async (Model, link) => {
  await Model.updateOne({ link: link }, { $inc: { hits: 1 } });
};

exports.removeLonk = async (Model, link) => {
  console.error("Deleted link " + link);
  await Model.deleteMany({ link: link });
};

exports.searchInDB = async (Model, link) => {
  const regex = new RegExp(escapeRegex(link), "gi");
  return await Model.find({ link: regex }).limit(20);
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
