const express = require("express");
const pug = require("pug");
const app = express();
const Query = require("./queries");

var router = express.Router();
app.use('/', router);

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.get("/", (req,res) => {
  res.render("homepage",{});
});

app.get("/id-for/:actorname", (req,res) => {
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

app.listen(3000, () => console.log('Started listening on 3000!'));
