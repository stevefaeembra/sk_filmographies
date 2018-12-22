const wdk = require('wikidata-sdk');
const https = require("https");

const Query = function() {

}

Query.prototype.getActorId = function (person_name) {

    // returns entity ID for person with that name

    var url = wdk.searchEntities({
      search: person_name,
      format: 'json',
      language: 'en'
    });

    return new Promise( (resolve, reject) => {
      https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
          body += data;
        });
        res.on("end", () => {
          body = JSON.parse(body);
          //console.log(body);
          for (var item of body.search) {
            if (item.label==person_name) {
              resolve(item.title);
            }
          }
          reject(`Can't find ${person_name}`);
        });
      });
    });
};

Query.prototype.getFilmsForActorId = function (actorId) {

  // returns list of films in chronologic order
  // given the person id
  var authorQid = actorId;
  var sparql = `SELECT ?item ?itemLabel (MIN(?date) AS ?date)
  WHERE {
    ?item wdt:P161 wd:${authorQid};
        wdt:P577 ?date
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  } GROUP BY ?item ?itemLabel
  ORDER BY (?date)
  `;
  console.log(sparql);
  var url = wdk.sparqlQuery(sparql);
  return new Promise( (resolve, reject) => {
    https.get(url, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {

        body = JSON.parse(body);
        console.log(body);
        resolve(body);
      });
    });
  });
};

module.exports = Query;
