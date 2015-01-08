"use strict"
const
  delco = require("../index.js"),
  url = require('url'),
  _ = require('lodash'),
  fs = require('fs'),
  cheerio = require('cheerio'),
  assert = require('assert');

describe('get borough urls from start page', function(){
  it('should load the html body, and return links to each borough', function(){
    let body = fs.readFileSync("test/boroughs.html")
    let boroughUrls = delco.parseBoroughs(body)
    assert.equal(boroughUrls.length, 56)
  })
})

describe('get street urls from borough page', function(){
  it('should load the html body, and return links to each street', function(){
    let body = fs.readFileSync("test/streets.html")
    let streetUrls = delco.parseStreets(body)
    assert.equal(streetUrls.length, 16)
    assert.equal(streetUrls[0], "http://w01.co.delaware.pa.us/pa/publicaccess.asp?municipality=17&realdistaddress=Submit&HNumber=&Street=a&Folio=&Map=&UAYN=Y")
  })
})

describe('get addresses from street page', function(){
  let addressUrls = []
  let body = ""

  before(function(){
    body = fs.readFileSync("test/addresses.html")
    addressUrls = delco.parseAddresses(body)
  })

  it('should load the html body, and return links to each address', function(){
    assert.equal(addressUrls.length, 11)
    assert.equal(addressUrls[0], "http://w01.co.delaware.pa.us/pa/publicaccess.asp?UAYN=Y&MyAction=RealFolioSearch&Folio=22-06-01379-00")
    assert.equal(_.last(addressUrls), "http://w01.co.delaware.pa.us/pa/publicaccess.asp?UAYN=Y&MyAction=RealAddressSearch&Municipality=22&HNumber=%20%20%20%20&Direction=&Street=LORAINE%20ST&Page=1")
  })
})

describe('get details from address page', function(){
  var property
  before(function(){
    let body = fs.readFileSync("test/address.html")
    property = delco.parseAddress(body)
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
