# Node.js library for the E1.31 (sACN) protocol

A Node.js module that provides simple client and server objects for communicating with devices using the E1.31 (sACN) protocol. A lot of information about E.131 (sACN) can be found on this [Wiki article](http://www.doityourselfchristmas.com/wiki/index.php?title=E1.31_(Streaming-ACN)_Protocol).

## Installation

To install, use `npm`:

    $ npm install e131

## Client Class

The Client class implements a UDP client for sending E1.31 (sACN) traffic. The class constructor is as follows:

```javascript
var e131 = require('e131');
var client = new e131.Client(arg, [port]);
```

The first argument can be a host address, name or universe number. If `port` is omitted, the default E1.31 port `5568` is used.
If a universe is given, the client will automatically join the relevant Multicast group.
The client automatically increments (and wraps around if necessary) the sequence number of the transmitted packet.

The client provides two methods:

* `createPacket(numSlots)`: creates a new E1.31 (sACN) packet to be used for sending.
* `send(packet)`: sends a E1.31 (sACN) packet to the remote host or multicast group.

Full code example for the Client class:

```javascript
var e131 = require('e131');

var client = new e131.Client('192.168.1.12');  // or use a universe
var packet = client.createPacket(24);  // we want 8 RGB (x3) slots
var slotsData = packet.getSlotsData();
packet.setSourceName('test E1.31 client');
packet.setUniverse(0x01);  // make universe number consistent with the client
packet.setOption(packet.Options.PREVIEW, true);  // don't really change any fixture
packet.setPriority(packet.DEFAULT_PRIORITY);  // not strictly needed, done automatically

// slotsData is a Buffer view, you can use it directly
var color = 0;
function cycleColor() {
  for (var idx=0; idx<slotsData.length; idx++) {
    slotsData[idx] = color % 0xff;
    color = color + 90;
  }
  client.send(packet, function () {
    setTimeout(cycleColor, 125);
  });
}
cycleColor();
```

## Server Class

The Server class implements a UDP server for receiving E1.31 (sACN) traffic. The class constructor is as follows:

```javascript
var e131 = require('e131');
var server = new e131.Server([universes], [port]);
```

The `universes` argument can be an array (for joining multiple universes) or a single integer for joining a single universe. If `universes` is omitted, a single value of `1` is assumed.

> **Note:** This library only uses one UDP socket and there is a maximum limit of 20 multicast memberships (universes) per single UDP socket. See issue #17 for more details.

If `port` is omitted, the default E1.31 port `5568` is used.
The server will join the corresponding Multicast groups for each provided universe automatically and starts listening as soon as it is created.
The server performs basic out-of-order detection on received packets. If an out-of-order packet is received, it is discarded.

The server supports the following events that you can listen to:

* `listening`: fires as soon as the server starts listening.
* `close`: fires when the server is closed.
* `error`: fires when an error occurs within the server.
* `packet`: (packet) fires when a valid E1.31 (sACN) packet is received.
* `packet-out-of-order`: (packet) fires when an out-of-order packet is received.
* `packet-error`: (packet, err) fires when an invalid packet is received.

Full code example for the Server class:

```javascript
var e131 = require('e131');

var server = new e131.Server([0x0001, 0x0002]);
server.on('listening', function() {
  console.log('server listening on port %d, universes %j', this.port, this.universes);
});
server.on('packet', function (packet) {
  var sourceName = packet.getSourceName();
  var sequenceNumber = packet.getSequenceNumber();
  var universe = packet.getUniverse();
  var slotsData = packet.getSlotsData();

  console.log('source="%s", seq=%d, universe=%d, slots=%d',
    sourceName, sequenceNumber, universe, slotsData.length);
  console.log('slots data = %s', slotsData.toString('hex'));
});
```

Universes to listen for can be added and droppped at any time by calling `addUniverse(universes)` or `dropUniverse(universes)`, respectively. The argument for these methods is an array of universe numbers.

## E1.31 (sACN) Packet Class

The E1.31 Packet class contains a number of useful setter methods:

* `setCID(uuid)`: sets the CID field into the root layer.
* `setSourceName(name)`: sets source name field into the frame layer.
* `setPriority(priority)`: sets the priority field into the frame layer.
* `setSequenceNumber(number)`: sets the sequence number into the frame layer.
* `setOption(option, state)`: sets the state of a framing option into the frame layer.
* `setUniverse(universe)`: sets the DMX universe into the frame layer.
* `setSlotsData(buffer)`: sets the DMX slots data into the DMP layer.

Also the following getter methods are provided:

* `getCID()`: gets the CID field from the root layer.
* `getSourceName()`: gets the source name field from the frame layer.
* `getPriority()`: gets the priority field from the frame layer.
* `getSequenceNumber()`: gets the sequence number from the frame layer.
* `getOption(option)`: gets the state of a framing option from the frame layer.
* `getUniverse()`: gets the DMX universe from the frame layer.
* `getSlotsData()`: gets the DMX slots data from the DMP layer.

Available E1.31 framing options are:

* `Options.TERMINATED`: the current packet is the last one in the stream. The receiver should stop processing further packets.
* `Options.PREVIEW`: the data in the packet should be only used for preview purposes, e.g. console display, and not to drive live fixtures.

Available constants in the Packet class are:

* `DEFAULT_PRIORITY`: the default priority number used to initialize new packets.

If a packet fails validation, the following errors can be returned:

* `ERR_ROOT_LAYER:` mismatch in the ACN PID or vector fields of the root layer.
* `ERR_FRAME_LAYER:` mismatch in the vector field of the frame layer.
* `ERR_DMP_LAYER:` mismatch in the type, addresses or vector fields of the DMP layer.
