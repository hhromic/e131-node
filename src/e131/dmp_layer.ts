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

export class DMPLayer {
  // DMP layer private constants
  private static readonly _VECTOR = 0x02;
  private static readonly _TYPE = 0xa1;
  private static readonly _FIRST_ADDRESS = 0x0000;
  private static readonly _ADDRESS_INCREMENT = 0x0001;

  private _buffer: Buffer

  private flength!: number;
  private vector!: number;
  private type!: number;
  private firstAddress!: number;
  private addressIncrement!: number;
  private propertyValueCount!: number;
  private propertyValues!: Buffer;

  constructor(buffer: Buffer){
    this._buffer = buffer
    this.update()
  }

  // init all fields to default values
  public init(numSlots: number) {
    var length = this.getLength();
    this._buffer.fill(0x00);
    this._buffer.writeUInt16BE(0x7000 | length, 0); // flength
    this._buffer.writeUInt8(DMPLayer._VECTOR, 2);
    this._buffer.writeUInt8(DMPLayer._TYPE, 3);
    this._buffer.writeUInt16BE(DMPLayer._FIRST_ADDRESS, 4);
    this._buffer.writeUInt16BE(DMPLayer._ADDRESS_INCREMENT, 6);
    this._buffer.writeUInt16BE(numSlots + 1, 8); // propertyValueCount
    this.update();
  }

  // update object fields from internal buffer
  public update() {
    this.flength = this._buffer.readUInt16BE(0);
    this.vector = this._buffer.readUInt8(2);
    this.type = this._buffer.readUInt8(3);
    this.firstAddress = this._buffer.readUInt16BE(4);
    this.addressIncrement = this._buffer.readUInt16BE(6);
    this.propertyValueCount = this._buffer.readUInt16BE(8);
    this.propertyValues = this._buffer.slice(10);
  }

  // get the bytes length of this DMP layer
  public getLength() {
    return this._buffer.length;
  }

  // get DMX slots data from this DMP layer
  public getSlotsData() {
    return this.propertyValues.slice(1);
  }

  // set DMX slots data on this DMP layer
  public setSlotsData(slotsData: Buffer) {
    slotsData.copy(this.propertyValues, 1, 0, this.propertyValueCount - 1);
  }

  // check if this DMP layer is valid
  public isValid() {
    return this.vector === DMPLayer._VECTOR &&
      this.type === DMPLayer._TYPE &&
      this.firstAddress === DMPLayer._FIRST_ADDRESS &&
      this.addressIncrement === DMPLayer._ADDRESS_INCREMENT;
  }
}