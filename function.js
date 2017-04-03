"use strict";
var api_key = "e8xvczy8ku63s96fat4jrd8f";
let http = require("http");
let activeAPI = "api.amp.active.com";

exports.handler = function(event, context, callback) {
//  let date = event.result.parameters['date'];
  let location = event.result.parameters['geo-city'];
  let options = searchRacesRequestOption(location);
  
  makeRequest(options, function( data, error) {
    let results = data.results;
    let races = [];
    results.forEach(function(result){
        races.push(result.assetName);
    })
    if (races) {
        callback(null, {"speech": races});
    }
    else {
        callback(null, {"speech": "I'm not sure!"});
    }
  });
};

function searchRacesRequestOption(location) {
    return {
        host: activeAPI,
        path: "/v2/search?query=running&category=event"+ "&start_date=2017-12-01" + '&near='+location + "&api_key=" + api_key
    };
}

function makeRequest(options, callback) {
    var request = http.request(options, 
    function(response) {
        var responseString = '';
        response.on('data', function(data) {
            responseString += data;
        });
         response.on('end', function() {
            var responseJSON = JSON.parse(responseString);
            callback(responseJSON, null);
        });
    });
    request.end();
}
