"use strict"

const
  cheerio = require('cheerio'),
  url = require('url'),
  _ = require('lodash'),
  DOMAIN = "http://w01.co.delaware.pa.us/pa/",
  BASE_URL = DOMAIN + "publicaccess.asp";


module.exports = {
  startURLs: function(){
    return [BASE_URL + "?municipality=21&realdistaddress=Submit&HNumber=&Street=ACHILLE+RD&Folio=&Map=&UAYN=Y&start=true"]
  },
  parse: function(URL, body) {
    URL = url.parse(URL, true)
    let $ = cheerio.load(body)
    return choosePageParser(URL)(URL, $)
  },
}

function choosePageParser(URL) {
  if(isBoroughUrl(URL)){
    return parseBoroughs
  } else if (isStreetUrl(URL)){
    return parseStreets
  } else if (isAddressUrl(URL)){
    return parseAddresses
  }
}

function parseBoroughs(URL, $){
  let municipalities = $("select[name=municipality] option")
  return _.map(municipalities, function(option){
    return BASE_URL + "?municipality=" + $(option).attr('value') + "&realdistaddress=Submit&HNumber=&Street=a&Folio=&Map=&UAYN=Y"
  })
}

function parseStreets(URL, $){
  URL = url.parse(URL, true)
  let
    municipality = URL["municipality"],
    streets = $("select#selstreet option")
  return _.map(streets, function(option){
    return BASE_URL + "?municipality=" + municipality + "&realdistaddress=Submit&HNumber=&Street=" + $(option).attr('value') + "&Folio=&Map=&UAYN=Y"
  })
}

function parseAddresses(URL, $){
  let rows = $("table[width='775']").children()
  return _.chain(rows)
    .tail()
    .map(function(row){ return $(row) })
    .select(function(row, index){
      let address = $($("td", row)[0]).text()
      return address.match(/\d+\s/) !== null
    })
    .map(function(row){ return DOMAIN + $($("a", row)[0]).attr("href") })
    .value()
}


function isBoroughUrl(URL) {
  return URL.query['start'] === "true"
}

function isStreetUrl(URL) {
  return URL.query['realdistaddress'] === "Submit"
}

function isAddressUrl(URL) {
  return URL.query['realaddress'] === "Submit"
}
