import { Peer } from "../lib/peerjs.js";
import { EventHandler } from "../lib/qwqframe.js";

export let context = {
    /** @type {Peer} */
    peer: null,
    peerId: "",
    peerErrorInfo: "",
    key: "",
    inited: false,
    initEvent: new EventHandler(),
    /** @type {EventHandler<MediaStream>} */
    streamIncomeEvent: new EventHandler(),
    disconnectEvent: new EventHandler(),
    hasStream: false,

    /** @type {MediaStream} */
    localAudioStream: null,

    cPeerId: "",
    cPeerUnavailable: false,
    cPeerUnavailableEvent: new EventHandler(),
    
    /** @type {import("../lib/peerjs.js").MediaConnection} */
    call: null
};