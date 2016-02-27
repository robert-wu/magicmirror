#!/usr/bin/env node
var http = require('http');
var Forecast = require('forecast.io');
var app = require('express')();
var http1 = require('http').Server(app);
var io = require('socket.io')(http1);

var PORT=3007;

var bigDatas = new Array();

var options = {
    APIKey: "87ec4bf1fc35459c03dba26ce116fd5b",
    timeout: 2500
},
forecast = new Forecast(options);
 
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
        socket.emit('CH01','Success');
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
        socket.emit('CH01',out);
    }
  });
    socket.on('CH02', function (goodMess) {
    var strData= goodMess.substring(4,goodMess.length)
    var choice=goodMess.substring(0,3);
    console.log("Recieved:"+goodMess);
    if(choice=='kin'){
        var datas=strData.split(',');
        for(var i=0;i<datas.length;i++){
            var parts=datas[i].split(':');
            bigDatas[parts[0]]=parts[1];
        }
        socket.emit('CH02','Success');
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
        socket.emit('CH02',out);
    }
  });
});
   
http1.listen(PORT, function(){
  console.log('listening on *:'+PORT);
});

forecast.get(34.137260, -118.128216, function (err, res, data) {
    //console.log("calledFor")
    if (err) console.log("timeout");
    //console.log('res: ' + res);
    //console.log('data: ' + data);
    bigDatas['weather']=data["currently"]["summary"];
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
            out+=table[i]['symbol']+'_'+table[i]['Ask']+'_'+table[i]['ChangeinPercent']+';'
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
        bigDatas['weather']=data["currently"]["summary"];
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
                out+=table[i]['symbol']+'_'+table[i]['Ask']+'_'+table[i]['ChangeinPercent']+';'
            }
            out+=')';
            bigDatas['stock']=out;
            console.log(bigDatas['stock']);
        });
    });
}, 180000); // retry every 3 mins