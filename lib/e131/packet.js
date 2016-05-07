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

var RootLayer = require('./rootlayer');
var FrameLayer = require('./framelayer');
var DMPLayer = require('./dmplayer');

// packet object constructor
function Packet(arg) {
  if (this instanceof Packet === false) {
    return new Packet(arg);
  }

  if (arg && Buffer.isBuffer(arg)) { // initialize from a buffer
    if (arg.length < 126) {
      throw new RangeError('buffer size should be of at least 126 bytes');
    }
    this.rootLayer = new RootLayer(arg.slice(0, 38));
    this.frameLayer = new FrameLayer(arg.slice(38, 115));
    this.dmpLayer = new DMPLayer(arg.slice(115));
  }
  else if (arg && Number.isInteger(arg)) { // initialize using number of channels
    if (arg < 1 || arg > 512) {
      throw new RangeError("number of channels should be in the range [1-512]");
    }
    this.rootLayer = new RootLayer();
    this.frameLayer = new FrameLayer();
    this.dmpLayer = new DMPLayer(arg);
  }
  else { // invalid argument type
    throw new TypeError('arg should be a Buffer object or a number of channels');
  }
}

// validate this E1.31 packet
Packet.prototype.validate = function validate() {
  if (!this.rootLayer.isValid()) {
    return this.ERR_ROOT_LAYER;
  }
  if (!this.frameLayer.isValid()) {
    return this.ERR_FRAME_LAYER;
  }
  if (!this.dmpLayer.isValid()) {
    return this.ERR_DMP_LAYER;
  }
  return this.ERR_NONE;
};

// set CID on this E1.31 packet
Packet.prototype.setCID = function setCID(cid) {
  this.rootLayer.setCID(cid);
};

// set source name on this E1.31 packet
Packet.prototype.setSourceName = function setSourceName(sourceName) {
  this.frameLayer.setSourceName(sourceName);
};

// set priority on this E1.31 packet
Packet.prototype.setPriority = function setPriority(priority) {
  this.frameLayer.setPriority(priority);
};

// set sequence number on this E1.31 packet
Packet.prototype.setSequenceNumber = function setSequenceNumber(sequenceNumber) {
  this.frameLayer.setSequenceNumber(sequenceNumber);
};

// set options on this E1.31 packet
Packet.prototype.setOptions = function setOptions(options) {
  this.frameLayer.setOptions(options);
};

// set DMX universe on this E1.31 packet
Packet.prototype.setUniverse = function setUniverse(universe) {
  this.frameLayer.setUniverse(universe);
};

// set DMX channel data on this E1.31 packet
Packet.prototype.setChannelData = function setChannelData(channelData) {
  this.dmpLayer.setChannelData(channelData);
};

// get CID from this E1.31 packet
Packet.prototype.getCID = function getCID() {
  return this.rootLayer.cid;
};

// get source name from this E1.31 packet
Packet.prototype.getSourceName = function getSourceName() {
  return this.frameLayer.sourceName;
};

// get priority from this E1.31 packet
Packet.prototype.getPriority = function getPriority() {
  return this.frameLayer.priority;
};

// get sequence number from this E1.31 packet
Packet.prototype.getSequenceNumber = function getSequenceNumber() {
  return this.frameLayer.sequenceNumber;
};

// get options from this E1.31 packet
Packet.prototype.getOptions = function getOptions() {
  return this.frameLayer.options;
};

// get DMX universe from this E1.31 packet
Packet.prototype.getUniverse = function getUniverse() {
  return this.frameLayer.universe;
};

// get DMX channel data from this E1.31 packet
Packet.prototype.getChannelData = function getChannelData() {
  return this.dmpLayer.propertyValues.slice(1);
};

// increment (and wrap around) sequence number from this E1.31 packet
Packet.prototype.incrementSequenceNumber = function incrementSequenceNumber() {
  this.frameLayer.sequenceNumber++;
  if (this.frameLayer.sequenceNumber > 255) {
    this.frameLayer.sequenceNumber = 0;
  }
};

// E1.31 layer error constants
Packet.prototype.ERR_NONE = 0;
Packet.prototype.ERR_ROOT_LAYER = 1;
Packet.prototype.ERR_FRAME_LAYER = 2;
Packet.prototype.ERR_DMP_LAYER = 3;

// module exports
module.exports = Packet;
