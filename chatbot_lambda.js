"use strict";
var api_key = "*************";
var todayDate = new Date().toISOString().split('T')[0];
var http = require("http");
var date;
var activeAPI = "api.amp.active.com";
var slackAttachments = [];
console.log("slackAttachments" + slackAttachments);

exports.handler = function(event, context, callback) {

    var searchQuery = extractSearchParams(event.result.parameters);
    let options = searchRacesRequestOption(searchQuery);
      
    makeRequest(options, function(data, error) {
        let results = parseResult(data.results);
        console.log(results);
        console.log("search:" + searchQuery.searchTerm);
        console.log(searchQuery.searchTerm.replace('+', ' '));
        let reply = "There are " + results.numRaces + " running races for " + searchQuery.searchTerm.replace(/\+/g,' ');
        if (results) {
            callback(null, {
                    "speech": reply,
                    "displayText": reply,
                    "data": {"slack": 
                        {"text":reply,
                         "attachments":results.slackAttachments
                        }
                    },
                    "source": "Active Activities API"
                });
            }
            else {
                callback(null, {"speech": "I'm not sure!"});
            }
          });
};

function extractSearchParams(data){
    data['date-period'] ? date = data['date-period'] : date = todayDate;
    var searchTerm = data.activityType.replace(" ","+") + "+" + data['geo-country'] + data['geo-city'];
    var obj = {
        date:  date,
        searchTerm: searchTerm,
    };
    return obj;
}

function searchRacesRequestOption(searchQuery) {
    return {
        host: activeAPI,
        path: "/v2/search?query=" + searchQuery.searchTerm + "&sort=date_asc&start_date="+ searchQuery.date +".."+"&api_key=" + api_key
    };
}

function parseResult(races){
    let numRaces = races.length;
    races.forEach(function(race){
        slackAttachments.push({
            "fallback": race.assetName,
            "color": "#36a64f",
            "title": race.assetName,
            "title_link": race.homePageUrlAdr,
            "image_url": race.logoUrlAdr 
        })
    });
    return {
        numRaces:numRaces,
        slackAttachments:slackAttachments
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
