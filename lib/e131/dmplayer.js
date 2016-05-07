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

// DMP layer object constructor
function DMPLayer(buffer) {
  if (this instanceof DMPLayer === false) {
    return new DMPLayer(buffer);
  }
  this._buffer = buffer;
  this.update();
}

// reset all fields to default values
DMPLayer.prototype.reset = function reset() {
  this._buffer.fill(0x00);
  this._buffer.writeUInt16BE(0x720b, 0); // flength
  this._buffer.writeUInt8(DMPLayer.VECTOR, 2); // vector
  this._buffer.writeUInt8(0xa1, 3); // type
  this._buffer.writeUInt16BE(0x0001, 6); // addressIncrement
  this._buffer.writeUInt16BE(this._buffer.length - 10, 8); // propertyValueCount
  this.update();
};

// update object fields from internal buffer
DMPLayer.prototype.update = function update() {
  this.flength = this._buffer.readUInt16BE(0);
  this.vector = this._buffer.readUInt8(2);
  this.type = this._buffer.readUInt8(3);
  this.firstAddress = this._buffer.readUInt16BE(4);
  this.addressIncrement = this._buffer.readUInt16BE(6);
  this.propertyValueCount = this._buffer.readUInt16BE(8);
  this.propertyValues = this._buffer.slice(10);
};

// set DMX channel data on this DMP layer
DMPLayer.prototype.setChannelData = function setChannelData(channelData) {
  channelData.copy(this.propertyValues, 1, 0, this.propertyValueCount - 1);
};

// check if this DMP layer is valid
DMPLayer.prototype.isValid = function isValid() {
  return this.vector === DMPLayer.VECTOR;
};

// DMP layer constants
DMPLayer.VECTOR = 0x02;

// module exports
module.exports = DMPLayer;
