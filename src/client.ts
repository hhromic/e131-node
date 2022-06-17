var dgram = require('dgram');
var e131 = require('./utils');
var Packet = require('./e131/packet');

// E1.31 client object constructor
export class Client {
    private host: number|string
    private port: number
    private _socket: any

    constructor(host: number|string, port?:number ){
        this.host = Number.isInteger(host) ? e131.getMulticastGroup(host) : host;
        this.port = port || 5568;
        this._socket = dgram.createSocket('udp4');
    }

    // create a new E1.31 packet
    public createPacket(numSlots: number) {
        return new Packet(numSlots);
    }
    // send E1.31 packet
    public send(packet: any, callback: () => {}){
        callback = callback || function () {};
        this._socket.send(packet.getBuffer(), this.port, this.host, function onSend() {
            packet.incrementSequenceNumber();
            callback();
        });
    }
}
