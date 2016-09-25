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
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var e131 = require('./e131');

// E1.31 server object constructor
function Server(universe, port) {
  if (this instanceof Server === false) {
    return new Server(port);
  }
  EventEmitter.call(this);

  this.universe = universe || 0x01;
  this.port = port || e131.DEFAULT_PORT;
  this._socket = dgram.createSocket({type:'udp4', reuseAddr:true});
  this._lastSequenceNumber = 0;

  var self = this;
  this._socket.on('error', function onError(err) {
    self.emit('error', err);
  });
  this._socket.on('listening', function onListening() {
    self.emit('listening');
  });
  this._socket.on('close', function onClose() {
    self.emit('close');
  });
  this._socket.on('message', function onMessage(msg) {
    var packet = new e131.Packet(msg);
    var validation = packet.validate();
    if (validation === packet.ERR_NONE) {
      if (packet.getSequenceNumber() != self._lastSequenceNumber++) {
        self._lastSequenceNumber = packet.getSequenceNumber() + 1;
        self.emit('packet-out-of-order', packet);
      } else {
        self.emit('packet', packet);
      }
      self._lastSequenceNumber = self._lastSequenceNumber > 255 ? 0 : self._lastSequenceNumber;
    } else {
      self.emit('packet-error', packet, validation);
    }
  });
  this._socket.bind(this.port, function onListening() {
    var multicastGroup = e131.getMulticastGroup(self.universe);
    this.addMembership(multicastGroup);
  });
}

// close a listening E1.31 server
Server.prototype.close = function close() {
  this._socket.close();
};

// server object inherits from EventEmitter
util.inherits(Server, EventEmitter);

// module exports
module.exports = Server;
