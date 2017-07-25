// Simple Node & Socket server
 
var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , io = require('socket.io')(http)
  , sys = require('sys')
  , server;
 
server = http.createServer(function(req, res){
  var path = url.parse(req.url).pathname;
  switch (path){
    case '/':
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<h1>Formulario de ingreso.</h1>');
      res.end();
      break;
       
    case '/json.js':
    case '/test.html':
      fs.readFile(__dirname + path, function(err, data){
        if (err) return send404(res);
        res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
        res.write(data, 'utf8');
        res.end();
      });
      break;
    default: send404(res);
  }
}),
 
send404 = function(res){
  res.writeHead(404);
  res.write('404');
  res.end();
};
server.listen(8080);
 
// socket.io, I choose you
var io = io.listen(server)
  , buffer = [];
   
io.on('connection', function(client){
  console.log('client connected');
  console.dir(client);
  client.send({ buffer: buffer });
  client.broadcast.json.send({ announcement: client.id + ' connected' });
   
  client.on('message', function(message){
    var msg = { message: [client.id, message] };
    buffer.push(msg);
    if (buffer.length > 15) buffer.shift();
    client.broadcast.json.send(msg);
    console.log(msg);
});
  client.on('disconnect', function(){
    client.broadcast.json.send({ announcement: client.id + ' disconnected' });
  });
});
