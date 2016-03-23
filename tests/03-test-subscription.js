var assert = require('assert');
var server = require('../app.js');
var WebSocketClient = require('websocket').client;
var superagent = require('superagent');
var config = require('config');


var proto = config.has('Server.SSL') && config.get('Server.SSL') ? 'https' : 'http';
var wsProto = config.has('Server.SSL') && config.get('Server.SSL') ? 'wss' : 'ws';
var domain = config.get('Server.domain');
var url = wsProto + '://' + domain + ':' + config.get('Server.port') + '/comet/websocket';
var apiURL = proto + '://' + domain + ':' + config.get('Server.port') + '/';

describe('Subscription', function() {

    before(function() {
        server.listen(config.get('Server.port'));
    });

    after(function() {
    });

    it('Receives message sent via REST API', function(done){

        var client = new WebSocketClient();
        var signal = {channel: 'TEST_CHANNEL', rate: Math.random()};

        client.connect(url, null, null, null, null);
        client.on('connect', function(connection){
            connection.on('message', function(data){
                var utf8Data = data.utf8Data;
                var receivedData = {};
                console.log('Message received: ' + utf8Data);

                try{
                    receivedData = JSON.parse(utf8Data);
                } catch (e){
                    console.log('Message skipped because not JSON object. ' + e);
                }

                if ('channel' in receivedData){
                    assert.deepEqual(signal, receivedData);
                    done();
                }
            });

            // Send message through REST API after
            superagent.post(apiURL + 'messages', signal, function(){

            });
        });

    });
});