import { Client } from "./client"
import { Server } from "./server"

// compute the multicast group IP address for a universe
function getMulticastGroup(universe:number) {
    if (universe < 1 || universe > 63999) {
      throw new RangeError('universe should be in the range [1-63999]');
    }
    return '239.255.' + (universe >> 8) + '.' + (universe & 0xff);
}
//export * from "./utils"
export { Client, Server }