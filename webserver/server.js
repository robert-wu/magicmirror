#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var Forecast = require('forecast.io');
var app = require('express')();
var http1 = require('http').Server(app);
var io = require('socket.io')(http1);
var express = require('express');
var dispatcher = require('httpdispatcher');

var bigDatas = new Array();

var options = {
    APIKey: "87ec4bf1fc35459c03dba26ce116fd5b",
    timeout: 2500
},
forecast = new Forecast(options);

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    var strData= request.url.substring(2,request.url.length)
    var choices=strData.split('&');
    out='';
    for(var i=0;i<choices.length;i++){
        var parts=choices[i].split('=')
        out+=parts[0]+'='+bigDatas[choices[i]];
        if(i!=choices.length-1){
            out+=',';
        }
    }
    response.writeHead(404);
    response.end(out);
});
server.listen(8092, function() {
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
 
io.on('connection', function(socket){
    console.log('connection');
    socket.on('CH01', function (goodMess) {
    var strData= goodMess.substring(4,goodMess.length)
    var choice=goodMess.substring(0,3);
    console.log("Recieved:"+goodMess);
    if(choice=='kin'){
        var datas=strData.split(',');
        for(var i=0;i<datas.length;i++){
            var parts=datas[i].split(':');
            bigDatas[parts[0]]=parts[1];
        }
        socket.emit('Success');
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
        socket.emit(out);
    }
  });
});
   

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

http1.listen(3003, function(){
  console.log('listening on *:3001');
});

forecast.get(34.137260, -118.128216, function (err, res, data) {
    //console.log("calledFor")
    if (err) console.log("timeout");
    //console.log('res: ' + res);
    //console.log('data: ' + data);
    bigDatas['forcast']=data["currently"]["summary"];
    console.log(data["currently"]["summary"]);
});

http.get({
    host: 'query.yahooapis.com',
    path: '/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22GOOG,YHOO,MSFT%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'
}, function(response) {
    // Continuously update stream with data
    var body = '';
    response.on('data', function(d) {
        body += d;
    });
    response.on('end', function() {
        //console.log(body);
        // Data reception is done, do whatever with it!
        var parsed = JSON.parse(body);
        var table=parsed['query']['results']['quote'];
        //console.log(table);
        var out='(';
        for(var i=0;i<table.length;i++){
            out+=table[i]['symbol']+','+table[i]['Ask']+','+table[i]['ChangeinPercent']+';'
        }
        out+=')';
        bigDatas['stock']=out;
        console.log(bigDatas['stock']);
    });
});

var wait = setInterval(function() {
    forecast.get(34.137260, -118.128216, function (err, res, data) {
        //console.log("calledFor")
        if (err) console.log("timeout");
        //console.log('res: ' + res);
        //console.log('data: ' + data);
        bigDatas['forcast']=data["currently"]["summary"];
        console.log(data["currently"]["summary"]);
    });
    http.get({
        host: 'query.yahooapis.com',
        path: '/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22GOOG,YHOO%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(body);
            var table=parsed['query']['results']['quote'];
            //console.log(table);
            var out='(';
            for(var i=0;i<table.length;i++){
                out+=table[i]['symbol']+','+table[i]['Ask']+','+table[i]['ChangeinPercent']+';'
            }
            out+=')';
            bigDatas['stock']=out;
            console.log(bigDatas['stock']);
        });
    });
}, 180000); // retry every 3 mins