"use strict"

const delco = require('rei_pa_delaware_county')

module.exports = function(RED) {
  function ParseBoroughs(config){
    RED.nodes.createNode(this, config);
    var node = this;
    this.on('input', function(msg){
      let links = delco.parseBoroughs(msg.payload)
      node.send({
        payload: links
      })
    })
  },

  function ParseStreets(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.on('input', function(msg){
      let links = delco.parseStreets(msg.payload)
      node.send({
        payload: links
      })
    })
  },

  function ParseAddresses(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.on('input', function(msg){
      let links = delco.parseAddresses(msg.payload)
      node.send({
        payload: links
      })
    })
  },

  function ParseProperty(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.on('input', function(msg){
      let links = delco.parseProperty(msg.payload)
      node.send({
        payload: links
      })
    })
  },

  RED.nodes.registerType("parse-boroughs", ParseBoroughs)
  RED.nodes.registerType("parse-streets", ParseSteets)
  RED.nodes.registerType("parse-addresses", ParseAddresses)
  RED.nodes.registerType("parse-property", ParseProperty)
}
