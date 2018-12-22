const express = require("express");
const pug = require("pug");
const app = express();
const Query = require("./queries");

// app config

var router = express.Router();
app.use('/', router);
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

// endpoints

app.get("/", (req,res) => {
  res.render("homepage",{});
});

app.get("/id/:actorname", (req,res) => {
  // gets id for an actor by name
  const lookup = new Query();
  const actorName = req.params["actorname"];
  lookup.getActorId(actorName)
  .then((data) => {
    res.json({
      name: actorName,
      unid: data
    });
  })
});

app.get("/filmography/:actorname", (req,res) => {
  // gets filmography of an actor by name
  const lookup = new Query();
  const actorName = req.params["actorname"];
  lookup.getFilmsForActor(actorName)
  .then((data) => {
    console.log(data);
    res.render("filmography",{data:data});
  })
  .catch((error) => {
    res.json(error)
  })
});

app.listen(3000, () => console.log('Started listening on 3000!'));
