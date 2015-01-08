"use strict"
const
  delco = require("../index.js"),
  url = require('url'),
  _ = require('lodash'),
  fs = require('fs'),
  cheerio = require('cheerio'),
  assert = require('assert');

describe('parseBoroughs', function(){
  it('should load the html body, and return links to each borough', function(){
    let body = fs.readFileSync("test/boroughs.html")
    let boroughUrls = delco.parseBoroughs(body)
    assert.equal(boroughUrls.length, 56)
  })
})

describe('parseStreets', function(){
  it('should load the html body, and return links to each street', function(){
    let body = fs.readFileSync("test/streets.html")
    let streetUrls = delco.parseStreets(body)
    assert.equal(streetUrls.length, 16)
    assert.equal(streetUrls[0], "http://w01.co.delaware.pa.us/pa/publicaccess.asp?municipality=17&realdistaddress=Submit&HNumber=&Street=a&Folio=&Map=&UAYN=Y")
  })
})

describe('parseAddresses', function(){
  let propertyUrls = []
  let nextPageUrl = ""
  let body = ""

  before(function(){
    body = fs.readFileSync("test/addresses.html")
    let resp = delco.parseAddresses(body)
    propertyUrls = resp.propertyUrls
    nextPageUrl = resp.nextPageUrl
  })

  it('should return links to each address, as well as the next page', function(){
    assert.equal(propertyUrls.length, 10)
    assert.equal(propertyUrls[0], "http://w01.co.delaware.pa.us/pa/publicaccess.asp?UAYN=Y&MyAction=RealFolioSearch&Folio=22-06-01379-00")
  })

  it('should return a link to the next page', function(){
    assert.equal(nextPageUrl, "http://w01.co.delaware.pa.us/pa/publicaccess.asp?UAYN=Y&MyAction=RealAddressSearch&Municipality=22&HNumber=%20%20%20%20&Direction=&Street=LORAINE%20ST&Page=1")
  })
})

describe('parseAddresseswhen the results move to a different street', function(){
  let propertyUrls = []
  let nextPageUrl = ""
  let body = ""

  before(function(){
    body = fs.readFileSync("test/addresses_change_street.html")
    let resp = delco.parseAddresses(body)
    propertyUrls = resp.propertyUrls
    nextPageUrl = resp.nextPageUrl
  })

  // The site doesn't filter correctly, so even if you request street 'A', you'll
  // page to street 'B' and so on. Since those will be captured separately, we want
  // to make sure we don't send dupes, and stop going to the next page
  it('should only return the links to the first street name on page', function(){
    assert.equal(propertyUrls.length, 2)
  })

  it('should not return a nextPageUrl', function(){
    assert.equal(nextPageUrl, null)
  })
})

describe('parseProperty', function(){
  var property
  before(function(){
    let body = fs.readFileSync("test/address.html")
    property = delco.parseProperty(body)
  })

  it('should load the street address', function(){
    assert.equal(property.address, "701 Loraine St")
  })

  it("should load the owner's address", function(){
    assert.equal(property.owners.address, "701 Lorraine St Ardmore          , PA 19003")
  })

  // it("should load any delinquent info")
  // it("should load any hearing info")
})
