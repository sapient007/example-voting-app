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


// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');

async.retry(
  {times: 1000, interval: 1000},
  function(callback) {
    var votes = queryVotes();
    }
);

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
    rows.forEach(function(row){
      votes[row.vote_selection] = parseInt(row.count);
    });

    console.log(JSON.stringify(votes));
    io.sockets.emit("scores", JSON.stringify(votes));
    setTimeout(function() {queryVotes() }, 1000);
};

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
