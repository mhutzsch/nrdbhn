/**
 * Get the departures of a given station
 * Queries: https://datnet-nbe.etc-consult.de/datnet-nbe/xml?bhf=ATM
 * and: https://datnet-nbe.etc-consult.de/datnet-nbe/xml?bhf=?
 * formats xml to string and returns
 */

var UI = require('ui');
var ajax = require('ajax');

var Settings = require('settings');

// Set a configurable with just the close callback
Settings.config(
  { url: 'http://hutzsch.de/nordbahn' },
  function(e) {
    console.log('closed configurable');

    // Show the parsed response
    console.log(JSON.stringify(e.options));

    // Show the raw response if parsing failed
    if (e.failed) {
      console.log(e.response);
    }
  }
);

var options = Settings.option();
var departures = parseInt(options.departures);
var stations = [ ];

for (var key in options) {
  if (options.hasOwnProperty(key)) {
    if (options[key] === true) {
      stations.push(key);
    }
  }
}

var result = 'Abf | Ziel | Vsp\n';
var card = new UI.Card({
  title: 'NRDBHN',
  body: 'Lade Abfahrten ...',
  scrollable: true
});
card.show();
card.style('small');

function getStatus() {
  stations.forEach(function(station) {

    ajax({ url: 'https://datnet-nbe.etc-consult.de/datnet-nbe/xml?bhf=' + station, type: 'text' },
      function(data, status, request) {
        result = result + data.match(/<name>(.*?)<\/name>/)[1] + '\n';
        var filtered = data.match(/<abfahrt[\s\S]*?<\/abfahrt>/gm) || [];
        var num = departures;
  
        if (filtered.length < departures) num = filtered.length;
        
        for (var i = 0; i < num; i++) {
          result = result + filtered[i].match(/<zeit>(.*?)<\/zeit>/)[1] + ' ';
          result = result + filtered[i].match(/<ziel.+>(.*?)<\/ziel>/)[1] + ' ';
          result = result + filtered[i].match(/<prognosemin>(.*?)<\/prognosemin>/)[1] + '\n';
        }
        card.body(result);
        
      },
      function(error, status, request) {
        console.log('Failed to get status: ' + error);
      }
    );
  });
}

getStatus();

card.on('click', 'select', function() {
  card.body('Aktualisiere Abfahrten ...');
  result = 'Abf | Ziel | Vsp\n';
  getStatus();
});
