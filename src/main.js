import { Peer } from "../lib/peerjs.js";
import { uniqueIdentifierString } from "../lib/qwqframe.js";
import { context } from "./context.js";
import { initEntirely } from "./entirety.js";

(async () =>
{
    let url = new URL(document.location.href);

    let connectToId = url.searchParams.get("connectTo");
    if (connectToId != null)
    {
        initEntirely(false);
        context.cPeerId = connectToId;
        context.key = url.searchParams.get("key");
    }
    else
    {
        initEntirely(true);
        context.key = uniqueIdentifierString(3);
    }

    let peer = new Peer({
        config: {
            iceServers: [
                { url: "stun:stun.l.google.com:19302" },
                { url: "stun:stun.voipbuster.com" },
                { url: "stun:stun.voipstunt.com" },
                { url: "stun:stun.voip.aebc.com" },
                { url: "stun:stun.internetcalls.com" },
                { url: "stun:stun.rynga.com:3478" },
                { url: "stun:stun.ippi.fr:3478" },
            ]
        }
    });
    context.peer = peer;

    peer.on("open", (id) =>
    {
        console.log("Peer ID: " + id);
        context.peerId = id;
        context.inited = true;
        context.initEvent.trigger();

        if (connectToId && context.localAudioStream)
        {
            let cPeer = peer.connect(connectToId, { reliable: false });
            cPeer.on("open", function ()
            {
                cPeer.send("c:" + context.key);
            });
        }
    });
    peer.on("error", (error) =>
    {
        console.error("Peer error:", error.type, error);
        if (error?.type == "server-error" || error?.type == "network")
        {
            context.peerErrorInfo = "cannot reach signalling server";
            context.inited = true;
            context.initEvent.trigger();
        }
        else if (error?.type == "peer-unavailable")
        {
            context.cPeerUnavailable = true;
            context.cPeerUnavailableEvent.trigger();
        }
    });

    peer.on("connection", cPeer =>
    {
        cPeer.on("data", (data) =>
        {
            if (data == "c:" + context.key)
            {
                if (context.cPeerId && context.cPeerId != cPeer.peer)
                    return;
                context.cPeerId = cPeer.peer;
                let call = peer.call(cPeer.peer, context.localAudioStream);
                context.call = call;
                console.log("pushStream", cPeer.peer);
                call.on("stream", (stream) =>
                {
                    context.hasStream = true;
                    context.streamIncomeEvent.trigger(stream);
                });
                call.on("close", () =>
                {
                    context.hasStream = false;
                    context.disconnectEvent.trigger();
                });
                call.on("error", (error) =>
                {
                    console.error("Call error:", error.type, error);
                    context.hasStream = false;
                    context.disconnectEvent.trigger();
                });
            }
        });
    });

    peer.on("call", (call) =>
    {
        call.answer(context.localAudioStream);
        context.call = call;
        console.log("pushStream", call.peer);
        call.on("stream", (stream) =>
        {
            context.hasStream = true;
            context.streamIncomeEvent.trigger(stream);
        });
        call.on("close", () =>
        {
            context.hasStream = false;
            context.disconnectEvent.trigger();
        });
        call.on("error", (error) =>
        {
            console.error("Call error:", error.type, error);
            context.hasStream = false;
            context.disconnectEvent.trigger();
        });
    });

    window.addEventListener("beforeunload", () =>
    {
        if (context.call)
            context.call.close();
    });


    try
    {
        context.localAudioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                noiseSuppression: { ideal: true },
                autoGainControl: { ideal: false },
                echoCancellation: { ideal: false },
                channelCount: { ideal: 1 },
                sampleRate: { ideal: 44100 },
                sampleSize: { ideal: 16 }
            },
            video: false
        });
    }
    catch (err)
    {
        console.error(err);
    }
})();