var express = require("express");
var pug = require("pug");
const app = express();

var router = express.Router();
app.use('/', router);

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.get("/", (req,res) => {
  res.render("homepage",{});
})

app.listen(3000, () => console.log('Started listening on 3000!'));
