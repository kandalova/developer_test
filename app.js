const express = require('express');
const app = express();
const fs = require("fs");
var crypto = require('crypto')
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://readuser:12345@testclaster-ccjhh.mongodb.net/test?retryWrites=true&w=majority";
const jsonParser = express.json();
app.use(express.static(__dirname + "/public"));
const port = 3000;

MongoClient.connect(uri, { useNewUrlParser: true })
    .then(client => {
        const db = client.db('questionsdb');
        const collection = db.collection('questions');
        app.locals.collection = collection;
        app.listen(port, () => console.info(`App running on port ${port}`));

    }).catch(error => console.error(error));

app.get("/questions", function (request, response) {
    const collection = request.app.locals.collection;
    collection.find({}).project({ correct: 0 }).toArray(function (err, result) {
        if (err) return console.log(err);
        //console.log("in" + (result));
        fs.writeFile(__dirname + "/public/questions.js", "let questions = " + JSON.stringify(result), (err) => {
            if (err) {
                console.error(err)
                return;
            }
        });
        response.send();

    });

});

app.post("/result", jsonParser, function (request, response) {
    //console.log(request.body);
    if (!request.body) return response.sendStatus(400);
    const collection = request.app.locals.collection;
    collection.find({}).project({ correct: 1 }).toArray(function (err, corrects) {
        if (err) return console.log(err);
        //console.log("find collection: "+ corrects);
        response.json(getScore(request.body.answers, corrects));
        //response.send();
    });
});

function getScore(userAnswers, correctAnswers) {
    console.log (userAnswers);
    console.log("\n");
    console.log(correctAnswers);
    var correctCount = 0;

    for (var i = 0; i < userAnswers.length; i++) {
        var tmpAnswer = correctAnswers.find((obj) => { return obj._id == userAnswers[i].id}).correct;
        console.log (tmpAnswer);
        var cryptoAnswer = crypto.createHash('md5').update(userAnswers[i].answer).digest('hex');
        console.log (cryptoAnswer);
        if (tmpAnswer === cryptoAnswer) {
          correctCount++;
        }
    }
        console.log(correctCount);
    
    return correctCount;

}