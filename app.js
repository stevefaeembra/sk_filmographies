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

app.get("/film/:filmname", (req,res) => {

  // returns data claims for a given film (lots of data)

  const lookup = new Query();
  const filmName = req.params["filmname"];
  lookup.getEntityId(filmName)
  .then((filmId) => {
    return lookup.getFilmInfoFromId(filmId);
  })
  .then((data) => {
    res.json(data);
  })
  .catch((err) => {
    res.json({
      error: `Can't find "${filmName}"`
    });
  })
});

app.get("/cast/:filmname", (req,res) => {

  // finds actors for the given film name
  // film name is case sensitive and needs to match exactly the
  // name in wikipedia

  const lookup = new Query();
  const filmName = req.params["filmname"];

  let knownFilmId = "unknown";
  let knownActorIdArray = [];

  lookup.getEntityId(filmName)
  .then((filmId) => {
    // got film id, now look up its data
    knownFilmId = filmId;
    return lookup.getFilmInfoFromId(filmId);
  })
  .then((body) => {
    // extract the list of actors Ids
    return lookup.getActorIdsFromFilmId(knownFilmId, body);
  })
  .then((actorIdArray) => {
    // extract an array of actor names and ids
    knownActorIdArray = actorIdArray;
    return lookup.getActorDataFromIdArray(actorIdArray);
  })
  .then((actorData) => {
    const simplifiedActorData = lookup.simplifyActorData(knownActorIdArray, actorData);
    const data = {
      name: filmName,
      cast: simplifiedActorData
    };
    res.render("cast", {data: data});
  })
  .catch((err) => {
    res.json({
      error: `Can't find "${filmName}"`
    });
  })
});


app.get("/id/:entityname", (req,res) => {

  // gets id for an entity (actor or film)

  const lookup = new Query();
  const entityName = req.params["entityname"];
  lookup.getEntityId(entityName)
  .then((data) => {
    res.json({
      name: entityName,
      unid: data
    });
  })
  .catch((err) => {
    res.json({
      error: `Can't find "${entityName}"`
    });
  })
});


app.get("/filmography/:actorname", (req,res) => {

  // gets filmography of an actor by name

  const lookup = new Query();
  const actorName = req.params["actorname"];
  lookup.getFilmsForActor(actorName)
  .then((data) => {
    res.render("filmography",{data:data});
  })
  .catch((error) => {
    res.json(error)
  })
});


app.listen(3000, () => console.log('Started listening on 3000!'));
