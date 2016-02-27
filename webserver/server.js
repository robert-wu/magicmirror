#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var Forecast = require('forecast.io');

var bigDatas = new Array();

var options = {
    APIKey: "87ec4bf1fc35459c03dba26ce116fd5b",
    timeout: 2500
},
forecast = new Forecast(options);

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8090, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            var goodMess=message.utf8Data;
            var strData= goodMess.substring(4,goodMess.length)
            var choice=goodMess.substring(0,3);
            if(choice=='kin'){
                var datas=strData.split(',');
                for(var i=0;i<datas.length;i++){
                    var parts=datas[i].split(':');
                    bigDatas[parts[0]]=parts[1];
                }
                connection.sendUTF('Success');
            }
            else if(choice=='web'){
                var choices=strData.split(',');
                out='';
                for(var i=0;i<choices.length;i++){
                    out+=choices[i]+':'+bigDatas[choices[i]];
                    if(i!=choices.length-1){
                        out+=',';
                    }
                }
                connection.sendUTF(out);
            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

forecast.get(34.137260, -118.128216, function (err, res, data) {
    //console.log("calledFor")
    if (err) console.log("timeout");
    //console.log('res: ' + res);
    //console.log('data: ' + data);
    bigDatas['forcast']=["currently"]["summary"];
    console.log(data["currently"]["summary"]);
});

var wait = setInterval(function() {
    forecast.get(34.137260, -118.128216, function (err, res, data) {
        //console.log("calledFor")
        if (err) console.log("timeout");
        //console.log('res: ' + res);
        //console.log('data: ' + data);
        bigDatas['forcast']=["currently"]["summary"];
        console.log(data["currently"]["summary"]);
    });
}, 180000); // retry every 3 mins