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

var RootLayer = require('./root_layer');
var FrameLayer = require('./frame_layer');
var DMPLayer = require('./dmp_layer');

// packet object constructor
function Packet(arg) {
  if (this instanceof Packet === false) {
    return new Packet(arg);
  }

  if (arg === undefined) {
    throw new TypeError('arg should be a Buffer object or a number of slots');
  }

  if (Buffer.isBuffer(arg)) { // initialize from a buffer
    if (arg.length < 126) {
      throw new RangeError('buffer size should be of at least 126 bytes');
    }
    this._buffer = arg;
  }
  else if (Number.isInteger(arg)) { // initialize using number of slots
    if (arg < 1 || arg > 512) {
      throw new RangeError("number of slots should be in the range [1-512]");
    }
    this._buffer = Buffer.alloc(126 + arg);
  }

  this._rootLayer = new RootLayer(this._buffer.slice(0, 38));
  this._frameLayer = new FrameLayer(this._buffer.slice(38, 115));
  this._dmpLayer = new DMPLayer(this._buffer.slice(115));

  if (Number.isInteger(arg)) {
    this.init(arg);
  }
}

// init all fields to default values
Packet.prototype.init = function init(numSlots) {
  this._dmpLayer.init(numSlots);
  this._frameLayer.init(this._dmpLayer);
  this._rootLayer.init(this._frameLayer, this._dmpLayer);
  this.update();
};

// update object fields from internal buffer
Packet.prototype.update = function update() {
  this._rootLayer.update();
  this._frameLayer.update();
  this._dmpLayer.update();
};

// validate this E1.31 packet
Packet.prototype.validate = function validate() {
  if (!this._rootLayer.isValid()) {
    return this.ERR_ROOT_LAYER;
  }
  if (!this._frameLayer.isValid()) {
    return this.ERR_FRAME_LAYER;
  }
  if (!this._dmpLayer.isValid()) {
    return this.ERR_DMP_LAYER;
  }
  return this.ERR_NONE;
};

// check if this E1.31 packet should be discarded (sequence number out of order)
Packet.prototype.discard = function discard(lastSequenceNumber) {
  return this._frameLayer.discard(lastSequenceNumber);
};

// get the bytes length of this E1.31 packet
Packet.prototype.getLength = function getLength() {
  return this._buffer.length;
};

// get CID from this E1.31 packet
Packet.prototype.getCID = function getCID() {
  return this._rootLayer.getCID();
};

// get source name from this E1.31 packet
Packet.prototype.getSourceName = function getSourceName() {
  return this._frameLayer.getSourceName();
};

// get priority from this E1.31 packet
Packet.prototype.getPriority = function getPriority() {
  return this._frameLayer.getPriority();
};

// get sequence number from this E1.31 packet
Packet.prototype.getSequenceNumber = function getSequenceNumber() {
  return this._frameLayer.getSequenceNumber();
};

// get framing option state from this E1.31 packet
Packet.prototype.getOption = function getOption(option) {
  return this._frameLayer.getOption(option);
};

// get DMX universe from this E1.31 packet
Packet.prototype.getUniverse = function getUniverse() {
  return this._frameLayer.getUniverse();
};

// get DMX start code from this E1.31 packet
Packet.prototype.getStartCode = function getStartCode() {
  return this._dmpLayer.getStartCode();
}

// get DMX slots data from this E1.31 packet
Packet.prototype.getSlotsData = function getSlotsData() {
  return this._dmpLayer.getSlotsData();
};

// get the internal binary buffer from this E1.31 packet
Packet.prototype.getBuffer = function getBuffer() {
  return this._buffer;
};

// set CID on this E1.31 packet
Packet.prototype.setCID = function setCID(cid) {
  this._rootLayer.setCID(cid);
};

// set source name on this E1.31 packet
Packet.prototype.setSourceName = function setSourceName(sourceName) {
  this._frameLayer.setSourceName(sourceName);
};

// set priority on this E1.31 packet
Packet.prototype.setPriority = function setPriority(priority) {
  this._frameLayer.setPriority(priority);
};

// set sequence number on this E1.31 packet
Packet.prototype.setSequenceNumber = function setSequenceNumber(sequenceNumber) {
  this._frameLayer.setSequenceNumber(sequenceNumber);
};

// set framing options on this E1.31 packet
Packet.prototype.setOption = function setOption(option, state) {
  this._frameLayer.setOption(option, state);
};

// set DMX universe on this E1.31 packet
Packet.prototype.setUniverse = function setUniverse(universe) {
  this._frameLayer.setUniverse(universe);
};

// increment (and wrap around) sequence number from this E1.31 packet
Packet.prototype.incrementSequenceNumber = function incrementSequenceNumber() {
  this._frameLayer.incrementSequenceNumber();
};

// set DMX slots data on this E1.31 packet
Packet.prototype.setSlotsData = function setSlotsData(slotsData) {
  this._dmpLayer.setSlotsData(slotsData);
};

// E1.31 validation error constants
Packet.prototype.ERR_NONE = 0;
Packet.prototype.ERR_ROOT_LAYER = 1;
Packet.prototype.ERR_FRAME_LAYER = 2;
Packet.prototype.ERR_DMP_LAYER = 3;

// E1.31 framing options
Packet.prototype.Options = FrameLayer.prototype.Options;

// E1.31 packet default priority
Packet.prototype.DEFAULT_PRIORITY = FrameLayer.prototype.DEFAULT_PRIORITY;

// module exports
module.exports = Packet;
