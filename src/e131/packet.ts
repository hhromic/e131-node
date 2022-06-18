/* jshint node:true */
'use strict';

import { DMPLayer } from "./dmp_layer";
import { FrameLayer } from "./frame_layer";
import { RootLayer } from "./root_layer";

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


export class Packet {
  // E1.31 validation error constants
  public static readonly ERR_NONE = 0;
  public static readonly ERR_ROOT_LAYER = 1;
  public static readonly ERR_FRAME_LAYER = 2;
  public static readonly ERR_DMP_LAYER = 3;

  // E1.31 framing options
  readonly Options: {}

  // E1.31 packet default priority
  public static readonly DEFAULT_PRIORITY = FrameLayer.DEFAULT_PRIORITY;

  private _buffer: Buffer
  private _rootLayer: RootLayer
  private _frameLayer: FrameLayer
  private _dmpLayer: DMPLayer

  // packet object constructor
  constructor(arg: Buffer|number){
    if(Buffer.isBuffer(arg)) {
      // initialize from a buffer
      if (arg.length < 126) {
        throw new RangeError('buffer size should be of at least 126 bytes');
      }
      this._buffer = arg;
    } else if (Number.isInteger(arg)) { 
      // initialize using number of slots
      if (arg < 1 || arg > 512) {
        throw new RangeError("number of slots should be in the range [1-512]");
      }
      this._buffer = Buffer.alloc(126 + arg);
    } else {
      throw new TypeError('arg should be a Buffer object or a number of slots');
    }

    this._rootLayer = new RootLayer(this._buffer.slice(0, 38));
    this._frameLayer = new FrameLayer(this._buffer.slice(38, 115));
    this._dmpLayer = new DMPLayer(this._buffer.slice(115));

    this.Options = this._frameLayer.Options;

    if (typeof arg === "number") {
      this.init(arg);
    }
  }

  // init all fields to default values
  public init(numSlots: number) {
    this._dmpLayer.init(numSlots);
    this._frameLayer.init(this._dmpLayer);
    this._rootLayer.init(this._frameLayer, this._dmpLayer);
    this.update();
  }

  // update object fields from internal buffer
  public update() {
    this._rootLayer.update();
    this._frameLayer.update();
    this._dmpLayer.update();
  }

  // validate this E1.31 packet
  public validate() {
    if (!this._rootLayer.isValid()) {
      return Packet.ERR_ROOT_LAYER;
    }
    if (!this._frameLayer.isValid()) {
      return Packet.ERR_FRAME_LAYER;
    }
    if (!this._dmpLayer.isValid()) {
      return Packet.ERR_DMP_LAYER;
    }
    return Packet.ERR_NONE;
  };

  // check if this E1.31 packet should be discarded (sequence number out of order)
  public discard(lastSequenceNumber: number) {
    return this._frameLayer.discard(lastSequenceNumber);
  };

  // get the bytes length of this E1.31 packet
  public getLength() {
    return this._buffer.length;
  };

  // get CID from this E1.31 packet
  public getCID() {
    return this._rootLayer.getCID();
  };

  // get source name from this E1.31 packet
  public getSourceName() {
    return this._frameLayer.getSourceName();
  };

  // get priority from this E1.31 packet
  public getPriority() {
    return this._frameLayer.getPriority();
  };

  // get sequence number from this E1.31 packet
  public getSequenceNumber() {
    return this._frameLayer.getSequenceNumber();
  };

  // get framing option state from this E1.31 packet
  public getOption(option: number) {
    return this._frameLayer.getOption(option);
  };

  // get DMX universe from this E1.31 packet
  public getUniverse() {
    return this._frameLayer.getUniverse();
  };

  // get DMX slots data from this E1.31 packet
  public getSlotsData() {
    return this._dmpLayer.getSlotsData();
  };

  // get the internal binary buffer from this E1.31 packet
  public getBuffer() {
    return this._buffer;
  };

  // set CID on this E1.31 packet
  public setCID(cid: Buffer) {
    this._rootLayer.setCID(cid);
  };

  // set source name on this E1.31 packet
  public setSourceName(sourceName: string) {
    this._frameLayer.setSourceName(sourceName);
  };

  // set priority on this E1.31 packet
  public setPriority(priority: number) {
    this._frameLayer.setPriority(priority);
  };

  // set sequence number on this E1.31 packet
  public setSequenceNumber(sequenceNumber: number) {
    this._frameLayer.setSequenceNumber(sequenceNumber);
  };

  // set framing options on this E1.31 packet
  public setOption(option: number, state: boolean) {
    this._frameLayer.setOption(option, state);
  };

  // set DMX universe on this E1.31 packet
  public setUniverse(universe: number) {
    this._frameLayer.setUniverse(universe);
  };

  // increment (and wrap around) sequence number from this E1.31 packet
  public incrementSequenceNumber() {
    this._frameLayer.incrementSequenceNumber();
  };

  // set DMX slots data on this E1.31 packet
  public setSlotsData(slotsData: Buffer) {
    this._dmpLayer.setSlotsData(slotsData);
  };
}
