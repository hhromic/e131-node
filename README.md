# Node.js library for the E1.31 (sACN) protocol

A Node.js module that provides simple client and server objects for communicating with devices using the E1.31 (sACN) protocol. A lot of information about E.131 (sACN) can be found on this [Wiki article](http://www.doityourselfchristmas.com/wiki/index.php?title=E1.31_(Streaming-ACN)_Protocol).

## Installation

To install, use ```npm```:

```shell
$ npm install e131
```

## Client Class

[TODO]

## Server Class

The Server class implements a UDP server for receiving E1.31 (sACN) traffic. The class constructor is as follows:

```javascript
var e131 = require('e131');
var server = new e131.Server([universe], [port]);
```

If ```universe``` is omitted, a value of ```1``` is assumed. If ```port``` is omitted, the default E1.31 port ```5568``` is used.
The server will join the corresponding Multicast group automatically and starts listening as soon as it is created.
The server performs basic out-of-order detection on received packets. If an out-of-order packet is received, it is discarded.

The server supports the following events that you can listen to:

* ```listening```: ...
* ```close```: ...
* ```error```: ...
* ```packet```: ...
* ```packet-out-of-order```: ...
* ```packet-error```: ...

Full code example for the Server class:

```javascript
var e131 = require('e131');

var server = new e131.Server();
server.on('listening', function() {
  console.log('server listening on port %d, universe %d', this.port, this.universe);
});
server.on('packet', function (packet) {
  var sourceName = packet.getSourceName();
  var sequenceNumber = packet.getSequenceNumber();
  var universe = packet.getUniverse();
  var channelData = packet.getChannelData();

  console.log('source="%s", seq=%d, universe=%d, channels=%d',
    sourceName, sequenceNumber, universe, channelData.length);
  console.log('channel data = %s', channelData.toString('hex'));
});
```

## E1.31 (sACN) Packet Class

The E1.31 Packet class contains a number of useful methods:

* ```getCID()```: ...
* ```getSourceName()```: ...
* ```getPriority()```: ...
* ```getSequenceNumber()```: ...
* ```getOptions()```: ...
* ```getUniverse()```: ...
* ```getChannelData()```: ...

If a packet fails validation, the following errors can be returned:

* ```ERR_ROOT_LAYER:``` ...
* ```ERR_FRAME_LAYER:``` ...
* ```ERR_DMP_LAYER:``` ...
