"use strict"
const
  delco = require("../delco.js"),
  url = require('url'),
  fs = require('fs'),
  cheerio = require('cheerio'),
  assert = require('assert')

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
  it('should load the html body, and return links to each address', function(){
    let body = fs.readFileSync("test/addresses.html")
    let addressUrls = delco.parse("http://w01.co.delaware.pa.us/pa/publicaccess.asp?realaddress=Submit&municipality=22&HNumber=&Street=LORAINE+ST&Folio=&Map=&UAYN=Y", body)
    assert.equal(addressUrls.length, 10)
    assert.equal(addressUrls[0], "http://w01.co.delaware.pa.us/pa/publicaccess.asp?UAYN=Y&MyAction=RealFolioSearch&Folio=22-06-01379-00")
  })
})
