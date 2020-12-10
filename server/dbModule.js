const mongoose = require('mongoose'),
    ObjectID = require("mongodb").ObjectID
let db;

//Connect to MongoDB With Authentication. 
exports.cnctDBAuth = (collectionname) => {
    const mongAuth = require('./mongoauth.json')
    mongoose.connect(
        "mongodb://localhost:27017/" + collectionname,
        {
            "auth": {
                "authSource": "admin"
            },
            "user": mongAuth.username,
            "pass": mongAuth.pass,
            useNewUrlParser: true, 
            useUnifiedTopology: true
        }
    );

    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log("Connected to MongoDB using collection " + collectionname)
    });
}

//Connect to MongoDB
exports.cnctDB = (collectionname) => {
    let dbLink = `mongodb://localhost/${collectionname}`
    mongoose.connect(dbLink, { useNewUrlParser: true, useUnifiedTopology: true });

    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log("Connected to MongoDB using " + collectionname)
    });

}

//Finds "toFind" in Database on the Model provided
exports.findInDBOne = async (Model, toFind) => {
    return await Model.findOne({ name: toFind })
}

exports.findInDB = async (Model) => {
    return await Model.find({});
}

//takes input with type Model. Saves that model in Database. Cant be used before cnctDB or cnctDBAuth.
exports.saveToDB = (input) => {
    input.save(() => {})
}