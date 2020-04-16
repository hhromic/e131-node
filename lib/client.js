/* jshint node:true */
'use strict';

/*!
 * Node.js client/server library for the E1.31 (sACN) protocol
 * Hugo Hromic - http://github.com/hhromic
 *
 * Copyright 2016 Hugo Hromic
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var dgram = require('dgram');
var e131 = require('./e131');

// E1.31 client object constructor
function Client(arg, port) {
  if (this instanceof Client === false) {
    return new Client(arg, port);
  }

  this.host = Number.isInteger(arg) ? e131.getMulticastGroup(arg) : arg;
  this.port = port || e131.DEFAULT_PORT;
  this._socket = dgram.createSocket('udp4');
}

// create a new E1.31 packet
Client.prototype.createPacket = function createPacket(numSlots) {
  return new e131.Packet(numSlots);
};

// send E1.31 packet
Client.prototype.send = function send(packet, callback) {
  callback = callback || function() {};
  this._socket.send(packet.getBuffer(), this.port, this.host || e131.getMulticastGroup(packet.getUniverse()), function onSend() {
    packet.incrementSequenceNumber();
    callback();
  });
};

// module exports
module.exports = Client;
