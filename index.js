"use strict";
// search page
// - iterate through townships
//   - refreshes page to yield all of the streets

// So I can just load all the townships' pages to get all of the streets, and then feed those combos into the queue

const
  request = require('request'),
  url = require('lodash'),

var numPagesParsed = 0;

pageHrefPublisher.bind('tcp://*:5432', function(err){
  console.log('Listening for subscribers...')
  _.each(startURLS(), function(link){
    allURLS.add(link)
    pageHrefPublisher.send(link)
  })
})

pageSub.subscribe("");
pageSub.on("message", function(pageURL){
  var pageURL = pageURL.toString()
  request(pageURL, function(err, resp, body){
    numPagesParsed = numPagesParsed + 1
    if(err) {
      console.log(err);
      throw err;
    }
    let newLinks = delco.parse(pageURL, body) || []

    //

    _.each(newLinks, pageHrefPublisher.send)
  })
})


pageSub.connect("tcp://localhost:5432")
console.log("listening for pages")
