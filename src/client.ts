
var dgram = require('dgram');
var e131 = require('./utils');
// E1.31 client object constructor
function Client(this: any, arg: unknown, port?: any): void {
    if (this instanceof Client === false) {
        return new (Client as any)(arg, port)
    }
    if (arg === undefined) {
        throw new TypeError('arg should be a host address, name or universe');
    }
    this.host = Number.isInteger(arg) ? e131.getMulticastGroup(arg) : arg;
    this.port = port || e131.DEFAULT_PORT;
    this._socket = dgram.createSocket('udp4');
}
// create a new E1.31 packet
Client.prototype.createPacket = function createPacket(numSlots: any) {
    return new e131.Packet(numSlots);
};
// send E1.31 packet
Client.prototype.send = function send(packet: { getBuffer: () => any; incrementSequenceNumber: () => void; }, callback: () => void) {
    callback = callback || function () { };
    this._socket.send(packet.getBuffer(), this.port, this.host, function onSend() {
        packet.incrementSequenceNumber();
        callback();
    });
};
export { Client };
