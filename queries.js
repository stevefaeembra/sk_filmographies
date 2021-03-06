const wdk = require('wikidata-sdk');
const https = require("https");

const Query = function() {

}

Query.prototype.getActorIdsFromFilmId = function (filmId, body) {

  // interested in the claims under P161
  // returns an array with actors' Ids
  // (but not labels sadly)

  const result = body.entities[filmId].claims.P161.map((item) => {
    return item.mainsnak.datavalue.value.id;
  })
  return result;
};

Query.prototype.getActorDataFromIdArray = function (idArray) {

  // given an array of wikidata ids, returns an array
  // of ids and labels

  const url = wdk.getEntities({
    ids: idArray,
    languages: ['en'],
    props: ['labels'],
    format: 'json'
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
        resolve(body);
      });
    });
  });

};

Query.prototype.simplifyActorData = function (actorIdArray, actorData) {

  // simplifies output from the getActorDataFromIdArray function
  // returns an array of objects with {actorId, name} e.g.
  // {actorId:"Q325141", name:"Charles Hawtrey"}

  results = [];
  actorIdArray.forEach((actorId) => {
    const actorName = actorData.entities[actorId].labels.en.value;
    results.push({
      actorId: actorId,
      name: actorName
    });
  });
  return results;

};

Query.prototype.getFilmInfoFromId = function (filmId) {

  // get known data about a film from its id

  const url = wdk.getEntities({
    ids: [filmId],
    languages: ['en'],
    props: ['info', 'claims','labels'],
    format: 'json'
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
        resolve(body);
      });
    });
  });
};


Query.prototype.getEntityId = function (entityName) {

    // returns entity ID for person with that name

    var url = wdk.searchEntities({
      search: entityName,
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
            if (item.label==entityName) {
              resolve(item.title);
            }
          }
          reject(`Can't find ${entityName}`);
        });
      });
    });
};


Query.prototype.getFilmsForActorId = function (actorId) {

  // returns list of films in chronologic order
  // given the person id

  var authorQid = actorId;
  var sparql = `
  SELECT ?item ?itemLabel (MIN(?date) AS ?date)
  WHERE {
    ?item wdt:P161 wd:${authorQid};
        wdt:P577 ?date
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  } GROUP BY ?item ?itemLabel
  ORDER BY (?date)
  `;
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
        resolve(body);
      });
    });
  });
};


Query.prototype.getFilmsForActor = function (actorName) {

  // get films for an actor name
  // chains two SPARL queries together

  return new Promise((resolve,reject) => {
    this.getEntityId(actorName)
    .then((data) => {
      const actorId = data;
      return this.getFilmsForActorId(data);
    })
    .then((filmography) => {
      resolve({
        name : actorName,
        filmography: this.simplifyReturnedFilmography(filmography)
      });
    })
    .catch((err) => {
      reject({
        error: err
      })
    })
  });
};


Query.prototype.simplifyReturnedFilmography = function (filmography) {

  // simplifies filmography structure, flattens out the deeply nested return
  // from WikiData.

  let result = [];
  filmography.results.bindings.forEach((binding) => {
    const filmName = binding.itemLabel.value;
    const date = binding.date.value;
    const year=parseInt(date.substring(0,5));
    const month=parseInt(date.substring(5,7));
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    result.push({
      filmName: filmName,
      year: year,
      month: monthNames[month]
    });
  });
  return result;
};

module.exports = Query;
