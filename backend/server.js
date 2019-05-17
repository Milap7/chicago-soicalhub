////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/27/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//////////////////////              SETUP NEEDED                ////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

//  Install Nodejs (the bundle includes the npm) from the following website:
//      https://nodejs.org/en/download/


//  Before you start nodejs make sure you install from the  
//  command line window/terminal the following packages:
//      1. npm install express
//      2. npm install pg
//      3. npm install pg-format
//      4. npm install moment --save
//      5. npm install elasticsearch


//  Read the docs for the following packages:
//      1. https://node-postgres.com/
//      2.  result API: 
//              https://node-postgres.com/api/result
//      3. Nearest Neighbor Search
//              https://postgis.net/workshops/postgis-intro/knn.html    
//      4. https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/quick-start.html
//      5. https://momentjs.com/
//      6. http://momentjs.com/docs/#/displaying/format/


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


const express = require('express');

var pg = require('pg');


var bodyParser = require('body-parser');

const moment = require('moment');

// var event = require('events');
// var util = require('util');



// Connect to elasticsearch Server

const elasticsearch = require('elasticsearch');
const esClient = new elasticsearch.Client({
  host: '127.0.0.1:9200',
  log: 'error'
});


var find_places_task_completed = false;             


const app = express();
const router = express.Router();


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());



// Connect to PostgreSQL server

var conString = "pg://postgres:kakashi009@127.0.0.1:5433/chicago_divvy_stations";
var pgClient = new pg.Client(conString);

var WSS = require('ws').Server;
var wss = new WSS({ port: 8081 });

var broadcast = function(payload) {

    wss.clients.forEach(function each(client) {
        client.send(payload);
        console.log('Sent: ');
    });
}


pgClient.connect((err, client) => {
    if (err) {
        console.log(err);
    } else {
        client.on('notification', (msg) => {
            // console.log(msg.channel);
            var pl = JSON.parse(msg.payload);
            // dbEventEmitter.emit(msg.channel, pl);
            console.log("New Data Added");
            console.log(msg.payload);
            // stations_logs.push(msg.payload);
            broadcast(msg.payload);


        });
    }
    client.query('LISTEN table_update');

});


router.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});



var places_found = [];
var stations_found = [];
var place_selected;
var stations_logs = [];
var station_elastic_logs = [];
var station_heatMap = [];



/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

//////   The following are the routes received from NG/Browser client        ////////

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



router.route('/places').get((req, res) => {

    res.json(places_found)
    
});



router.route('/place_selected').get((req, res) => {

    res.json(place_selected)
   
});



router.route('/allPlaces').get((req, res) => {

    res.json(places_found)
   
});


router.route('/findLog10').get((req,res) => {
    res.json(stations_logs)
});




router.route('/stations').get((req, res) => {
   
    res.json(stations_found)
           
});

router.route('/findLogElastic').get((req,res) => {
    // console.log("Staion_Logs from sever: " + res.json(stations_logs));
    res.json(station_elastic_logs);
    
})


// router.route('/findLog').get((req,rest) => {
//     res.json(stations_logs)
// });

// const getter = (stationId) => {
//     return stations_logs[stationId];
// };
//



router.route('/places/find').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    find_places_task_completed = false;             

    find_places_from_yelp(req.body.find, req.body.where, req.body.zipcode).then(function (response) {
        var hits = response;
        res.json(places_found);
        console.log("Places Found: " + places_found);
    });

});


router.route('/stations/find').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    for (var i = 0,len = places_found.length; i < len; i++) {

        if ( places_found[i].name === req.body.placeName ) { // strict equality test

            place_selected = places_found[i];

            break;
        }
    }
 
    const query = {
        // give the query a unique name
        name: 'fetch-divvy',
        text: ' SELECT * FROM divvy_stations_status ORDER BY (divvy_stations_status.where_is <-> ST_POINT($1,$2)) LIMIT 3',
        values: [place_selected.latitude, place_selected.longitude]
    }

    find_stations_from_divvy(query).then(function (response) {
        var hits = response;
        // res.json({'stations_found': 'Added successfully'});
        res.json(stations_found);
    });

    // res.json(stations_found);
 

});


router.route('/stations/findLog').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);


    const query = {
        // give the query a unique name
        name: 'fetch-divvy-logs',
        text: ' SELECT * FROM divvy_stations_logs WHERE timecreated >= NOW() - $1 * interval \'1 hour\' AND timecreated <= NOW() AND id = $2 ORDER BY timecreated ASC',
        values: [req.body.hours, req.body.stationID]
    }

    get_divvy_logs(query).then(function (response) {
        var hits = response;
        res.json(stations_logs);
    });


});

//  Get Divvy logs from logstash-elasticsearch  
router.route('/stations/findDivvyLog').post((req,res) => {
    var str = JSON.stringify(req.body, null, 4);
    date = new Date();

    timeInterval = req.body.hours;

    console.log("time Interval from front end", timeInterval);

    formatdate = moment(date.setHours(date.getHours() - timeInterval)).format('YYYY-MM-DD HH:mm:ss');


    find_divvy_from_elastic(req.body.stationID, formatdate, date).then(function (response) {
        var hits = response;
        res.json(station_elastic_logs);
        // console.log("Stations Found from elasticsearch: " + hits);
    });


})

router.route('/stations/findDivvyHeatMap').post((req,res) => {
    var str = JSON.stringify(req.body, null, 4);
    divvy_heatMap(req.body.hours).then(function (response) {
        var hits = response;
        res.json(station_heatMap);
        // console.log("Stations Found from elasticsearch: " + hits);
    });
})


//Async function for Divvy-Elastic

async function divvy_heatMap(hours) {
    var timezoneoffset = new Date().getTimezoneOffset() / 60
    var hourinteval = parseInt(hours) + parseInt(timezoneoffset);
    console.log("Num of hours: " + hours);
    console.log("Hour Interval: " + hourinteval);
    let body = {
        size: 100000,
        from: 0,
        "query": {
            "bool" : {
              "filter":{ 
                  "range" : 
                    {
                      "timeCreated" : {
                          "gt" : "now-"+hourinteval+"h" 
                      }
                    }
                }
            },
          },
		"sort" : [
			{"timeCreated" : { "order" : "asc" } }
		]
    }

    results = await esClient.search({index: 'divvy_stations_logs', body: body});
    station_heatMap = [];
    results.hits.hits.forEach((hit, index) => {
        plainTextDateTime =  moment(hit._source.lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');
        logTime = moment(hit._source.timeCreated).format('YYYY-MM-DD, h:mm:ss a');
        var station = {
            "id": hit._source.id,
            "stationName": hit._source.stationName,
            "availableBikes": hit._source.availableBikes,
            "availableDocks": hit._source.availableDocks,
            "is_renting": hit._source.is_renting,
            "lastCommunicationTime": plainTextDateTime,
            "latitude": hit._source.latitude,
            "longitude": hit._source.longitude,
            "status": hit._source.status,
            "totalDocks": hit._source.totalDocks,
            "timeCreated" : logTime
        };
        station_heatMap.push(station);
    });
}

async function find_divvy_from_elastic(stationID, hours) {

    var timezoneoffset = new Date().getTimezoneOffset() / 60
    var hourinteval = parseInt(hours) + parseInt(timezoneoffset);
    console.log("Num of hours: " + hours);
    console.log("Hour Interval: " + hourinteval);
    let body = {
        size: 100000,
        from: 0,
        "query": {
          "bool" : {
            "must" : {
               "match" : { "id" : stationID } 
            },
            "filter":{ 
			    "range" : 
			      {
                    "lastCommunicationTime.keyword" : {
                        "gte" : formatdate, "lt" :date.keyword 
                    }
                  }
			  }
          },
        },
		"sort" : [
			{"lastCommunicationTime.keyword" : { "order" : "asc" } }
		]
    }

    results = await esClient.search({index: 'divvy_stations_logs', body: body});
    station_elastic_logs = [];
    results.hits.hits.forEach((hit, index) => {
        // plainTextDateTime =  moment(hit._source.lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');
        logTime = moment(hit._source.timeCreated).format('YYYY-MM-DD, h:mm:ss a');
        var station = {
            "id": hit._source.id,
            "stationName": hit._source.stationName,
            "availableBikes": hit._source.availableBikes,
            "availableDocks": hit._source.availableDocks,
            "is_renting": hit._source.is_renting,
            "lastCommunicationTime": hit._source.lastCommunicationTime,
            "latitude": hit._source.latitude,
            "longitude": hit._source.longitude,
            "status": hit._source.status,
            "totalDocks": hit._source.totalDocks,
            "timeCreated" : hit._source.lastCommunicationTime //Change from logTime to lastCoummunicationTime
        };
        station_elastic_logs.push(station);
    });

    // console.log(station_elastic_logs);
}



/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Divvy - PostgreSQL - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



async function find_stations_from_divvy(query) {

    const response = await pgClient.query(query);

    stations_found = [];

    for (i = 0; i < 3; i++) {
                
         plainTextDateTime =  moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');
    

        var station = {
                    "id": response.rows[i].id,
                    "stationname": response.rows[i].stationname,
                    "availablebikes": response.rows[i].availablebikes,
                    "availabledocks": response.rows[i].availabledocks,
                    "is_renting": response.rows[i].is_renting,
                    "lastCommunicationTime": plainTextDateTime,
                    "latitude": response.rows[i].latitude,    
                    "longitude": response.rows[i].longitude,
                    "status": response.rows[i].status,
                    "totaldocks": response.rows[i].totaldocks
        };

        stations_found.push(station);

    }


}

// async function get_divvy_logs(query) {

//     const response = await pgClient.query(query);

//     stations_logs = [];
//     // console.log("length="+response.rows.length)

//     for (i = 0; i < response.rows.length; i++) {
//     // console.log("i="+i)
//         plainTextDateTime =  moment(response.rows[i].lastcommunicationtime).format('YYYY-MM-DD, h:mm:ss a');
//         // console.log(response.rows[i].timecreated);
//         logTime = moment(response.rows[i].timecreated).format('YYYY-MM-DD, h:mm:ss a');
//         // console.log(logTime);
//         var station = {
//             "id": response.rows[i].id,
//             "stationname": response.rows[i].stationname,
//             "availablebikes": response.rows[i].availablebikes,
//             "availabledocks": response.rows[i].availabledocks,
//             "is_renting": response.rows[i].is_renting,
//             "lastCommunicationTime": plainTextDateTime,
//             "latitude": response.rows[i].latitude,
//             "longitude": response.rows[i].longitude,
//             "status": response.rows[i].status,
//             "totaldocks": response.rows[i].totaldocks,
//             "timecreated" : logTime
//         };

//         stations_logs.push(station);

//     }


// }




/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

////////////////////    Yelp - ElasticSerch - Client API            /////////////////

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////



async function find_places_from_yelp(place, where, zipcode) {

    places_found = [];

//////////////////////////////////////////////////////////////////////////////////////
// Using the business name to search for businesses will leead to incomplete results
// better to search using categorisa/alias and title associated with the business name
// For example one of the famous places in chicago for HotDogs is Portillos
// However, it also offers Salad and burgers
// Here is an example of a busness review from Yelp for Pertilos
//               alias': 'portillos-hot-dogs-chicago-4',
//              'categories': [{'alias': 'hotdog', 'title': 'Hot Dogs'},
//                             {'alias': 'salad', 'title': 'Salad'},
//                             {'alias': 'burgers', 'title': 'Burgers'}],
//              'name': "Portillo's Hot Dogs",
//////////////////////////////////////////////////////////////////////////////////////


    let body = {
        size: 1000,
        from: 0,
        "query": {
          "bool" : {
            "must" : {
               "term" : { "categories.alias" : place } 
            },
            // "filter" : [
            //     {"term" : {"location.address1" : where}},
            //     {"term" : {"location.zip_code" : zipcode}}
            // ],
            // "filter": {
            //     "term" : { "location.address1" : where  }
                
            // },
            // "filter": {
            //     "term" : { "location.zip_code" : zipcode  }
            // },
            // // "match" : {
            // //     "location.address1" : where
            // // },
            // // "match" : {
            // //     "location.zip_code" : zipcode
            // // // },
            //     "should" : [

            //         {"filter": {
            //              "term" : { "location.address1" : where  }
                
            //          } },

            //          { "filter": {
            //             "term" : { "location.zip_code" : zipcode  }
            //          }},
            //     ],
            "filter" :
             {
                 "bool" : {
                     "should" : [
                        { "term" : {"location.address1" : where}},
                        {"term" : {"location.zip_code" : zipcode}}
                     ]
                 }
             },

            "must_not" : {
              "range" : {
                "rating" : { "gte" : 4.0 }
              }
            },

            "must_not" : {
              "range" : {
                "review_count" : { "lte" : 500 }
              }
            },

            "should" : [
              { "term" : { "is_closed" : "false" } }
            ],
          }
        }
    }


    results = await esClient.search({index: 'chicago_yelp_reviews', body: body});

    results.hits.hits.forEach((hit, index) => {
        

        var place = {
                "name": hit._source.name,
                "display_phone": hit._source.display_phone,
                "address1": hit._source.location.address1,
                "is_closed": hit._source.is_closed,
                "rating": hit._source.rating,
                "review_count": hit._source.review_count,
                "latitude": hit._source.coordinates.latitude,    
                "longitude": hit._source.coordinates.longitude
        };

        places_found.push(place);
    });
    console.log(places_found);

    find_places_task_completed = true;             
      
}
router.route('/places/findZipcode').post((req, res) => {

    var str = JSON.stringify(req.body, null, 4);

    find_places_task_completed = false;             

    find_places_from_yelp_zipcode(req.body.find, req.body.zipcode).then(function (response) {
        var hits = response;
        res.json(places_found);
        console.log("Places Found: " + places_found);
    });

});

/// Search Elasticsearch for restarauts using zipcode //

async function find_places_from_yelp_zipcode(place, zipcode) {

    places_found = [];

    let body = {
        size: 1000,
        from: 0,
        "query": {
          "bool" : {
            "must" : {
               "term" : { "categories.alias" : place } 
            },


            "filter": {
                "term" : { "location.postal_code" : zipcode  }
            },


            "must_not" : {
              "range" : {
                "rating" : { "lte" : 3 }
              }
            },

            "must_not" : {
              "range" : {
                "review_count" : { "lte" : 500 }
              }
            },

            "should" : [
              { "term" : { "is_closed" : "false" } }
            ],
          }
        }
    }


    results = await esClient.search({index: 'chicago_yelp_reviews', body: body});

    results.hits.hits.forEach((hit, index) => {
        

        var place = {
                "name": hit._source.name,
                "display_phone": hit._source.display_phone,
                "address1": hit._source.location.address1,
                "is_closed": hit._source.is_closed,
                "rating": hit._source.rating,
                "review_count": hit._source.review_count,
                "latitude": hit._source.coordinates.latitude,    
                "longitude": hit._source.coordinates.longitude
        };

        places_found.push(place);
    });
    console.log(places_found);

    find_places_task_completed = true;             
      
}

app.use('/', router);

app.listen(4000, () => console.log('Express server running on port 4000'));

