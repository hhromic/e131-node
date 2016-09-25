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

// root layer object constructor
function RootLayer(buffer) {
  if (this instanceof RootLayer === false) {
    return new RootLayer(buffer);
  }
  this._buffer = buffer;
  this.update();
}

// reset all fields to default values
RootLayer.prototype.reset = function reset() {
  this._buffer.fill(0x00);
  this._buffer.writeUInt16BE(0x10, 0); // preambleSize
  RootLayer.ACN_ID.copy(this._buffer, 4); // acnId
  this._buffer.writeUInt16BE(0x726e, 16); // flength
  this._buffer.writeUInt32BE(RootLayer.VECTOR, 18); // vector
  this.update();
};

// update object fields from internal buffer
RootLayer.prototype.update = function update() {
  this.preambleSize = this._buffer.readUInt16BE(0);
  this.postambleSize = this._buffer.readUInt16BE(2);
  this.acnId = this._buffer.slice(4, 16);
  this.flength = this._buffer.readUInt16BE(16);
  this.vector = this._buffer.readUInt32BE(18);
  this.cid = this._buffer.slice(22, 38);
};

// set the CID field on this root layer
RootLayer.prototype.setCID = function setCID(cid) {
  cid.copy(this.cid, 0, 0, 16);
};

// check if this root layer is valid
RootLayer.prototype.isValid = function isValid() {
  return this.acnId.equals(RootLayer.ACN_ID) && this.vector === RootLayer.VECTOR;
};

// root layer constants
RootLayer.ACN_ID = Buffer.from(
  [0x41, 0x53, 0x43, 0x2d, 0x45, 0x31, 0x2e, 0x31, 0x37, 0x00, 0x00, 0x00]);
RootLayer.VECTOR = 0x00000004;

// module exports
module.exports = RootLayer;
