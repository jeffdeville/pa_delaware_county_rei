"use strict"
const
  delco = require("../delco.js"),
  url = require('url'),
  _ = require('lodash'),
  fs = require('fs'),
  cheerio = require('cheerio'),
  assert = require('assert');
  // replay = require('replay');

describe('get borough urls from start page', function(){
  it('should load the html body, and return links to each borough', function(){
    let body = fs.readFileSync("test/boroughs.html")
    let boroughUrls = delco.parse(delco.startURLs()[0], body)
    assert.equal(boroughUrls.length, 56)
  })
})

describe('get street urls from borough page', function(){
  it('should load the html body, and return links to each street', function(){
    let body = fs.readFileSync("test/streets.html")
    let streetUrls = delco.parse("http://w01.co.delaware.pa.us/pa/publicaccess.asp?municipality=17&realdistaddress=Submit&HNumber=&Street=a&Folio=&Map=&UAYN=Y", body)
    assert.equal(streetUrls.length, 16)
  })
})

describe('get addresses from street page', function(){
  let addressUrls = []
  let body = ""

  before(function(){
    body = fs.readFileSync("test/addresses.html")
    addressUrls = delco.parse("http://w01.co.delaware.pa.us/pa/publicaccess.asp?realaddress=Submit&municipality=22&HNumber=&Street=LORAINE+ST&Folio=&Map=&UAYN=Y", body)
  })

  it('should load the html body, and return links to each address', function(){
    assert.equal(addressUrls.length, 11)
    assert.equal(addressUrls[0], "http://w01.co.delaware.pa.us/pa/publicaccess.asp?UAYN=Y&MyAction=RealFolioSearch&Folio=22-06-01379-00")
    assert.equal(_.last(addressUrls), "http://w01.co.delaware.pa.us/pa/publicaccess.asp?UAYN=Y&MyAction=RealAddressSearch&Municipality=22&HNumber=%20%20%20%20&Direction=&Street=LORAINE%20ST&Page=1")
  })

  it('should not include any duplicate links', function(){
    delco.setAllUrls(addressUrls)
    // debugger
    addressUrls = delco.parse("http://w01.co.delaware.pa.us/pa/publicaccess.asp?realaddress=Submit&municipality=22&HNumber=&Street=LORAINE+ST&Folio=&Map=&UAYN=Y", body)
    assert.equal(addressUrls.length, 0)
  })
})

describe('get details from address page', function(){
  // The parser needs to kick out events that let addresses be saved, or just
  // perform the saves itself. But the question will simply be how to override
  // the database storage. Or do I bother to do so at all? No, I think in this
  // case, I should start by just testing the scraping by calling a different
  // method, and then I can extract it later. There should be an initialize
  // section that provides the persistence strategy actually:
  // delco.initialize(saveToDbFunc)

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

describe('evaluate whether the owner lives in the residence or not', function(){
  it("should match if they are the same")
  it("should not match if they are different")
})
