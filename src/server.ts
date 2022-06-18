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
import { Packet } from "./e131/packet"
import { e131Utils } from "./utils";
import { EventEmitter } from "stream";
const dgram = require('dgram');

export class Server extends EventEmitter{
  private universes: Array<number>
  private port: number
  private ip: string
  private _socket: any
  private _lastSequenceNumber: any

  constructor (universes?: Array<number>, universe?: number, port?: number, ip?: string) {
    super()
    if (universes) {
      this.universes = universes
    } else if (universe) {
      this.universes = [universe]
    } else {
      //default to universe 1
      this.universes = [1]
    }
    this.port = port || 5568
    this.ip = ip || '127.0.0.1'

    //create actual connection
    this._socket = dgram.createSocket('udp4');
    this._lastSequenceNumber = {};

    this.setupServer()
  }

  private setupServer(){
    var self = this;
    this.universes.forEach(function (universe: string | number) {
      self._lastSequenceNumber[universe] = 0;
    });
    this._socket.on('error', function onError(err: any) {
      self.emit('error', err);
    });
    this._socket.on('listening', function onListening() {
      self.emit('listening');
    });
    this._socket.on('close', function onClose() {
      self.emit('close');
    });
    this._socket.on('message', function onMessage(msg: any) {
      var packet = new Packet(msg);
      var validation = packet.validate();
      if (validation !== Packet.ERR_NONE) {
        self.emit('packet-error', packet, validation);
        return;
      }
      if (packet.discard(self._lastSequenceNumber[packet.getUniverse()])) {
        self.emit('packet-out-of-order', packet);
      } else {
        self.emit('packet', packet);
      }
      self._lastSequenceNumber[packet.getUniverse()] = packet.getSequenceNumber();
    });
    this._socket.bind(this.port, function onListening() {
      self.universes.forEach(function (this: any, universe: any) {
        var multicastGroup = e131Utils.getMulticastGroup(universe);
        self._socket.addMembership(multicastGroup, self.ip);

      });
    });
  }

  public close() {
    this._socket.close();
  }

  public getUniverses(): Array<number>{
    return this.universes
  }

  public getPort(): number {
    return this.port
  }

  public getIP(): string {
    return this.ip
  }
}
