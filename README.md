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

* ```listening```: fires as soon as the server starts listening.
* ```close```: fires when the server is closed.
* ```error```: fires when an error occurs within the server.
* ```packet```: (packet) fires when a valid E1.31 (sACN) packet is received.
* ```packet-out-of-order```: (packet) fires when an out-of-order packet is received.
* ```packet-error```: (packet, err) fires when an invalid packet is received.

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

The E1.31 Packet class contains a number of useful getter methods:

* ```getCID()```: gets the CID field from the root layer.
* ```getSourceName()```: gets the source name field from the frame layer.
* ```getPriority()```: gets the priority field from the frame layer.
* ```getSequenceNumber()```: gets the sequence number from the frame layer.
* ```getOptions()```: gets the options from the frame layer.
* ```getUniverse()```: gets the universe from the frame layer.
* ```getChannelData()```: gets the DMX channel data from the DMP layer.

If a packet fails validation, the following errors can be returned:

* ```ERR_ROOT_LAYER:``` mismatch in the ACN ID or vector fields of the root layer.
* ```ERR_FRAME_LAYER:``` mismatch in the vector field of the frame layer.
* ```ERR_DMP_LAYER:``` mismatch in the vector field of the DMP layer.
