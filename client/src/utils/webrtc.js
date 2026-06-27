import Peer from "simple-peer";

export const createPeer = (initiator, stream) => {

    return new Peer({

        initiator,

        trickle: false,

        stream,

    });

};