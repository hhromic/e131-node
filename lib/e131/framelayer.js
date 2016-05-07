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

// frame layer object constructor
function FrameLayer(buffer) {
  if (this instanceof FrameLayer === false) {
    return new FrameLayer(buffer);
  }
  this._buffer = buffer;
  this.update();
}

// reset all fields to default values
FrameLayer.prototype.reset = function reset() {
  this._buffer.fill(0x00);
  this._buffer.writeUInt16BE(0x7258, 0); // flength
  this._buffer.writeUInt32BE(FrameLayer.VECTOR, 2); // vector
  this._buffer.writeUInt8(0x64, 70); // priority
  this._buffer.writeUInt16BE(0x0001, 75); // universe
  this.update();
};

// update object fields from internal buffer
FrameLayer.prototype.update = function update() {
  this.flength = this._buffer.readUInt16BE(0);
  this.vector = this._buffer.readUInt32BE(2);
  this.sourceName = this._buffer.toString('ascii', 6, 70);
  this.priority = this._buffer.readUInt8(70);
  this.reserved = this._buffer.readUInt16BE(71);
  this.sequenceNumber = this._buffer.readUInt8(73);
  this.options = this._buffer.readUInt8(74);
  this.universe = this._buffer.readUInt16BE(75);
};

// set the source name field on this frame layer
FrameLayer.prototype.setSourceName = function setSourceName(sourceName) {
  sourceName.copy(this._buffer, 6, 0, 64);
  this.update();
};

// set the priority field on this frame layer
FrameLayer.prototype.setPriority = function setPriority(priority) {
  this._buffer.writeUInt8(priority, 70);
  this.update();
};

// set the sequence number field on this frame layer
FrameLayer.prototype.setSequenceNumber = function setSequenceNumber(sequenceNumber) {
  this._buffer.writeUInt8(sequenceNumber, 73);
  this.update();
};

// set the options field on this frame layer
FrameLayer.prototype.setOptions = function setOptions(options) {
  this._buffer.writeUInt8(options, 74);
  this.update();
};

// set the universe field on this frame layer
FrameLayer.prototype.setUniverse = function setUniverse(universe) {
  if (universe < 1 || universe > 63999) {
    throw new RangeError('universe should be in the range [1-63999]');
  }
  this._buffer.writeUInt16BE(universe, 75);
  this.update();
};

// increment (and wrap around) sequence number on this frame layer
FrameLayer.prototype.incrementSequenceNumber = function incrementSequenceNumber() {
  var nextSequenceNumber = this.sequenceNumber + 1;
  if (nextSequenceNumber > 255) {
    nextSequenceNumber = 0;
  }
  this.setSequenceNumber(nextSequenceNumber);
};

// check if this frame layer is valid
FrameLayer.prototype.isValid = function isValid() {
  return this.vector === FrameLayer.VECTOR;
};

// frame layer constants
FrameLayer.VECTOR = 0x00000002;

// module exports
module.exports = FrameLayer;
