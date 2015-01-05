"use strict"
// It looks like all I need is the very first url, and then just follow the next
// links til the end... The problem is that there is no end, and if I go too
// far, I'll destroy their site. So perhaps instead what I need to do is look
// for unique urls, and then quit if I hit a page where none of the urls is
// unique

const
  cheerio = require('cheerio'),
  url = require('url'),
  _ = require('lodash'),
  DOMAIN = "http://w01.co.delaware.pa.us/pa/",
  BASE_URL = DOMAIN + "publicaccess.asp",
  Set = require('collections/set'),
  MULTIPLE_SPACES = /\s{2,}/;
require('./polyfills')

var _allUrls = new Set();
var _save; // function(home_info){}


module.exports = {
  init: function(saveFunc){
    _save = saveFunc;
  },
  startURLs: function(){
    return [BASE_URL + "?municipality=21&realdistaddress=Submit&HNumber=&Street=ACHILLE+RD&Folio=&Map=&UAYN=Y&start=true"]
  },
  parse: function(URL, body) {
    _allUrls.add(URL)
    URL = url.parse(URL, true)
    let $ = cheerio.load(body)
    return choosePageParser(URL)(URL, $)
  },

  parseAddress: function(body){
    // https://smartystreets.com/pricing - Consider this to see if the addresses
    // are really the same, and perhaps to load other info. It's costly though,
    // so I'll want to find a way to cache the calls
    let $ = cheerio.load(body)
    let crappyAddress = $($("th.violet")[0]).next().text()
    let ownerAddress = $("td.ltgreen").text()
    return {
      address: extractStreetAddress(crappyAddress),
      owners: extractOwnerInfo(ownerAddress)
    }
  },

  allUrls: function(){ return _allUrls },
  setAllUrls: function(urls){ _allUrls = new Set(urls); }
}

function choosePageParser(URL) {
  if(isBoroughUrl(URL)){
    return parseBoroughs
  } else if (isStreetUrl(URL)){
    return parseStreets
  } else if (isAddressUrl(URL)){
    return parseAddresses
  } else {
    throw "Can not map address"
  }
}

function uniqueUrls(urls){
  return _.select(urls, function(link){
    return !_allUrls.contains(link)
  })
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
  // Can't grab the rows directly, because there are sub-tables
  let rows = $("table[width='775']").children()
  var propertyUrls = _.chain(rows)
    .tail() // Skip the title row of the table
    .map(function(row){ return $(row) })  // just simplify the rest of the code
    .select(function(row, index) {
      // Only addresses w/ numbers are actual homes. Others are just land
      let address = $($("td", row)[0]).text()
      return address.match(/\d+\s/) !== null
    })
    .map(function(row){ return DOMAIN + $($("a", row)[0]).attr("href") }) // create link
    .select(function(link){
      return !_allUrls.contains(link) // Only keep the unique urls
    })
    .value();

  if (propertyUrls.length > 0) {
    propertyUrls.push(absoluteLink($($("#searchfooter a")[0])))
  }

  return propertyUrls
}

function absoluteLink(relativeUrlAnchor){
  return DOMAIN + relativeUrlAnchor.attr('href')
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

function extractStreetAddress(input){
  let spaces = input.strip().split(MULTIPLE_SPACES)

  if(spaces.length !== 2) {
    throw "Can not parse: " + input + "It was split into:" + spaces
  }
  let address = spaces[0]
  let number = parseInt(spaces[1])
  return number + " " + address
}

function extractOwnerInfo(input){
  let strippedLines = _.map(input.split("\r\n"), function(line){
    return line.strip()
  })
  let propertyInfo = {
    name: "",
    address: ""
  }
  // Now, I need to go through the lines, and parse them intelligently
  _.each(strippedLines, function(line){
    if(propertyInfo.name === "" || propertyInfo.name.endsWith("&")) {
      propertyInfo.name += " " + line
    } else {
      propertyInfo.address += " " + line
    }
  })
  propertyInfo.address = propertyInfo.address.strip()
  return propertyInfo
}



