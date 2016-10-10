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

// frame layer private constants
var _VECTOR = 0x00000002;

// frame layer object constructor
function FrameLayer(buffer) {
  if (this instanceof FrameLayer === false) {
    return new FrameLayer(buffer);
  }
  this._buffer = buffer;
  this.update();
}

// init all fields to default values
FrameLayer.prototype.init = function init(dmpLayer) {
  var length = this.getLength() + dmpLayer.getLength();
  this._buffer.fill(0x00);
  this._buffer.writeUInt16BE(0x7000 | length, 0);
  this._buffer.writeUInt32BE(_VECTOR, 2);
  this._buffer.writeUInt8(this.DEFAULT_PRIORITY, 70);
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

// get the bytes length of this frame layer
FrameLayer.prototype.getLength = function getLength() {
  return this._buffer.length;
};

// get source name from this frame layer
FrameLayer.prototype.getSourceName = function getSourceName() {
  return this.sourceName;
};

// get priority from this frame layer
FrameLayer.prototype.getPriority = function getPriority() {
  return this.priority;
};

// get sequence number from this frame layer
FrameLayer.prototype.getSequenceNumber = function getSequenceNumber() {
  return this.sequenceNumber;
};

// get state of framing option from this frame layer
FrameLayer.prototype.getOption = function getOption(option) {
  return Boolean(this.options & (1 << (option % 8)));
};

// get DMX universe from this frame layer
FrameLayer.prototype.getUniverse = function getUniverse() {
  return this.universe;
};

// set the source name field on this frame layer
FrameLayer.prototype.setSourceName = function setSourceName(sourceName) {
  Buffer.from(sourceName).copy(this._buffer, 6, 0, 64);
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

// set the state of a framing option on this frame layer
FrameLayer.prototype.setOption = function setOptions(option, state) {
  var newOptions = state === true ?
    this.options | (1 << (option % 8)) : this.options & ~(1 << (option % 8));
  this._buffer.writeUInt8(newOptions, 74);
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
  return this.vector === _VECTOR;
};

// check if the packet should be discarded (sequence number out of order)
FrameLayer.prototype.discard = function discard(lastSequenceNumber) {
  var sequenceNumberDiff = this.sequenceNumber - lastSequenceNumber;
  if (sequenceNumberDiff > -20 && sequenceNumberDiff <= 0)
    return true;
  return false;
};

// frame layer public constants
FrameLayer.prototype.DEFAULT_PRIORITY = 0x64;
FrameLayer.prototype.Options = {
  TERMINATED: 6,
  PREVIEW: 7,
};

// module exports
module.exports = FrameLayer;
