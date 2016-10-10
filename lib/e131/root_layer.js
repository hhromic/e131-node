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

// root layer private constants
var _PREAMBLE_SIZE = 0x0010;
var _POSTAMBLE_SIZE = 0x0000;
var _ACN_PID = Buffer.from([0x41, 0x53, 0x43, 0x2d, 0x45, 0x31, 0x2e, 0x31, 0x37, 0x00, 0x00, 0x00]);
var _VECTOR = 0x00000004;

// root layer object constructor
function RootLayer(buffer) {
  if (this instanceof RootLayer === false) {
    return new RootLayer(buffer);
  }
  this._buffer = buffer;
  this.update();
}

// init all fields to default values
RootLayer.prototype.init = function init(frameLayer, dmpLayer) {
  var length = 22 + frameLayer.getLength() + dmpLayer.getLength();
  this._buffer.fill(0x00);
  this._buffer.writeUInt16BE(_PREAMBLE_SIZE, 0);
  this._buffer.writeUInt16BE(_POSTAMBLE_SIZE, 2);
  _ACN_PID.copy(this._buffer, 4);
  this._buffer.writeUInt16BE(0x7000 | length, 16);
  this._buffer.writeUInt32BE(_VECTOR, 18);
  this.update();
};

// update object fields from internal buffer
RootLayer.prototype.update = function update() {
  this.preambleSize = this._buffer.readUInt16BE(0);
  this.postambleSize = this._buffer.readUInt16BE(2);
  this.acnPId = this._buffer.slice(4, 16);
  this.flength = this._buffer.readUInt16BE(16);
  this.vector = this._buffer.readUInt32BE(18);
  this.cid = this._buffer.slice(22, 38);
};

// get the bytes length of this root layer
RootLayer.prototype.getLength = function getLength() {
  return this._buffer.length;
};

// get CID from this root layer
RootLayer.prototype.getCID = function getCID() {
  return this.cid;
};

// set the CID field on this root layer
RootLayer.prototype.setCID = function setCID(cid) {
  cid.copy(this.cid, 0, 0, 16);
};

// check if this root layer is valid
RootLayer.prototype.isValid = function isValid() {
  return this.acnPId.equals(_ACN_PID) && this.vector === _VECTOR;
};

// module exports
module.exports = RootLayer;
