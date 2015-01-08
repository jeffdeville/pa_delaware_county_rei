"use strict"

require('./polyfills')

const
  cheerio = require('cheerio'),
  url = require('url'),
  _ = require('lodash'),
  Set = require('collections/set'),
  DOMAIN = "http://w01.co.delaware.pa.us/pa/",
  BASE_URL = "http://w01.co.delaware.pa.us/pa/publicaccess.asp",
  START_URL = "http://w01.co.delaware.pa.us/pa/publicaccess.asp?municipality=21&realdistaddress=Submit&HNumber=&Street=ACHILLE+RD&Folio=&Map=&UAYN=Y&start=true",

  MULTIPLE_SPACES = /\s{2,}/;

var _visitedUrls = new Set();

module.exports = {
  init: function(visitedUrls){
    _visitedUrls = new Set(visitedUrls);
  },

  parseBoroughs: function (body){
    let $ = cheerio.load(body)
    let municipalities = $("select[name=municipality] option")
    return _.map(municipalities, function(option){
      return BASE_URL + "?municipality=" + $(option).attr('value') + "&realdistaddress=Submit&HNumber=&Street=a&Folio=&Map=&UAYN=Y"
    })
  },

  parseStreets: function(body){
    let
      $ = cheerio.load(body),
      municipality = $("select[name=municipality] option[selected=selected]").attr("value"),
      streets = $("select#selstreet option")
    return _.map(streets, function(option){
      return BASE_URL + "?municipality=" + municipality + "&realdistaddress=Submit&HNumber=&Street=" + $(option).attr('value') + "&Folio=&Map=&UAYN=Y"
    })
  },

  parseAddresses: function(body){
    let getStreetAddress = function(row){
      return $($("td", row)[0]).text()
    }
    let getStreetName = function(row){
      return getStreetAddress(row).strip().replace(/\d+/, '').strip()
    }
    // If not all of the addresses are for the street in question, then this is the last page
    let isLastPage = function(urls, rows) { return urls.length != rows.length }

    let $ = cheerio.load(body)
    // Can't grab the rows directly, because there are sub-tables
    let rows = $("table[width='775']").children()
    var propertyRows = _.chain(rows)
      .tail() // Skip the title row of the table
      .map(function(row){ return $(row) })  // just simplify the rest of the code
      .select(function(row, index) {
        // Only addresses w/ numbers are actual homes. Others are just land
        let address = getStreetAddress(row)
        // let address = $($("td", row)[0]).text()
        return address.match(/\d+\s/) !== null
      })
      .value()

    let streetName = getStreetName(propertyRows[0])

    let propertyUrls = _.chain(propertyRows)
      .select(function(row) {
        return streetName === getStreetName(row)
      })
      .map(function(row){ return DOMAIN + $($("a", row)[0]).attr("href") }) // create link
      .value();

    let nextPageUrl = isLastPage(propertyUrls, propertyRows) ? null : absoluteLink($($("#searchfooter a")[0]))

    return {
      propertyUrls: propertyUrls,
      nextPageUrl: nextPageUrl
    }
  },

  parseProperty: function(body){
    let $ = cheerio.load(body)
    let crappyAddress = $($("th.violet")[0]).next().text()
    let ownerAddress = $("td.ltgreen").text()
    return {
      address: extractStreetAddress(crappyAddress),
      owners: extractOwnerInfo(ownerAddress)
    }
  },


}


function absoluteLink(relativeUrlAnchor){
  return DOMAIN + relativeUrlAnchor.attr('href')
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
