var express = require('express'),
    async = require('async'),
    pg = require('pg'),
    { Pool } = require('pg'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

io.set('transports', ['polling']);

var port = process.env.PORT || 4000;

io.sockets.on('connection', function (socket) {

  socket.emit('message', { text : 'Welcome!' });

  socket.on('subscribe', function (data) {
    socket.join(data.channel);
  });
});

// var pool = new pg.Pool({
//   connectionString: 'postgres://postgres:postgres@db/postgres'
// });

// async.retry(
//   {times: 1000, interval: 1000},
//   function(callback) {
//     pool.connect(function(err, client, done) {
//       if (err) {
//         console.error("Waiting for db");
// ``      }
//       callback(err, client);
//     });
//   },
//   function(err, client) {
//     if (err) {
//       return console.error("Giving up");
//     }
//     console.log("Connected to db");
//     getVotes(client);
//   }
// );


// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');

async function queryVotes() {
// Queries a public Shakespeare dataset.

    // Create a client
    const bigqueryClient = new BigQuery();
    console.log('created bigquery client');

    // The SQL query to run
    const sqlQuery = `SELECT vote_selection, count(voter_id) AS count FROM \`automl-document-mling.votes.votes\` GROUP BY vote_selection`;

    const options = {
    query: sqlQuery,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
    };

    // Run the query
    const [rows] = await bigqueryClient.query(options);
    
    var votes = {a: 0, b: 0};
    
    console.log('Rows:');
    // rows.forEach(row => {
    //   const url = row['vote_selection'];
    //   const viewCount = row['count'];
    //   votes[row.vote_selection] = parseInt(row.count);
    //   console.log(`url: ${url}, ${viewCount} views`);
    // });

    rows.forEach(function(row){
      votes[row.vote_selection] = parseInt(row.count);
    });

    console.log(JSON.stringify(votes));
    io.sockets.emit("scores", JSON.stringify(votes));
}

queryVotes();


// function getVotes(client) {
//   client.query('SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote', [], function(err, result) {
//     if (err) {
//       console.error("Error performing query: " + err);
//     } else {
//       var votes = collectVotesFromResult(result);
//       io.sockets.emit("scores", JSON.stringify(votes));
//     }

//     setTimeout(function() {getVotes(client) }, 1000);
//   });
// }

// function collectVotesFromResult(result) {
//   var votes = {a: 0, b: 0};

//   result.rows.forEach(function (row) {
//     votes[row.vote] = parseInt(row.count);
//   });

//   return votes;
// }

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

app.use(express.static(__dirname + '/views'));

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname + '/views/index.html'));
});

server.listen(port, function () {
  var port = server.address().port;
  console.log('App running on port ' + port);
});
