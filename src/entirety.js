import { bindArrayHook, bindValue, eventName, NAttr, NList, nTagName, NTagName, styles, NLocate, delayPromise, NElement } from "../lib/qwqframe.js";
import { context } from "./context.js";
import { body } from "./ui/body.js";
import { getHoverAsse } from "./ui/hover.js";

let cardLoc = new NLocate();
let audio = new Audio();

/**
 * 初始化整个ui
 */
export function initEntirely(hostMode)
{
    let callStarted = false;

    context.streamIncomeEvent.add(stream =>
    {
        audio.srcObject = stream;
        audio.play();
    });

    body.addChild(NList.getElement([
        styles({
            height: "100%",
            width: "100%",
            // backgroundColor: "rgb(0, 0, 0)",
            userSelect: "none",
            position: "fixed",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }),

        [
            styles({
                height: "450px",
                width: "280px",
                backgroundColor: "rgb(254, 254, 254)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "5px",

                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "space-evenly",
                gap: "10px"
            }),

            [
                styles({
                    fontSize: "1.6em"
                }),
                "简单电话"
            ],

            (hostMode ? [
                styles({
                    height: "60px",
                    width: "60px",
                    borderRadius: "100px",
                    color: "rgb(255, 255, 255)",
                    fontSize: "1.4em",

                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }),

                "拨",

                getHoverAsse({
                    backgroundColor: "rgb(80, 215, 90)",
                }, {
                    backgroundColor: "rgb(70, 195, 80)",
                }),

                eventName.click(async (e, ele) =>
                {
                    if (callStarted)
                        return;
                    callStarted = true;

                    await ele.animateCommit([{
                        opacity: 1
                    }, {
                        opacity: 0
                    }], 330);

                    ele.remove();

                    if (!context.inited)
                    {
                        let ele = NList.getElement([
                            "正在连接中转服务..."
                        ]);
                        cardLoc.insBefore(ele);
                        await context.initEvent.oncePromise();
                        ele.remove();
                    }

                    if (context.peerErrorInfo && !context.peerId)
                    {
                        let ele = NList.getElement([
                            [
                                "连接错误:",
                            ],
                            [
                                context.peerErrorInfo
                            ]
                        ]);
                        cardLoc.insBefore(ele);
                        return;
                    }

                    if (!context.localAudioStream)
                    {
                        let ele = NList.getElement([
                            [
                                "无法获取本地音频流",
                            ],
                            [
                                "请检查麦克风权限",
                            ]
                        ]);
                        cardLoc.insBefore(ele);
                        return;
                    }

                    cardLoc.insBefore(NList.getElement([
                        styles({
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                            justifyContent: "space-evenly",
                            gap: "30px"
                        }),
                        [
                            styles({
                                width: "fit-content",
                                whiteSpace: "pre-wrap",
                                fontSize: "11px",
                                color: "rgba(30, 30, 30, 0.8)"
                            }),
                            "会话id:\n",
                            context.peerId,
                            "\n",
                            "就绪 正在等待连接..."
                        ],
                        [
                            styles({
                                height: "40px",
                                width: "80px",
                                borderRadius: "5px",
                                color: "rgb(255, 255, 255)",
                                fontSize: "1em",

                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }),
                            "复制链接",
                            getHoverAsse({
                                backgroundColor: "rgb(80, 215, 90)",
                            }, {
                                backgroundColor: "rgb(70, 195, 80)",
                            }),
                            eventName.click(async (e, ele) =>
                            {
                                let url = new URL(document.location.href);
                                url.searchParams.set("connectTo", context.peerId);
                                url.searchParams.set("key", context.key);
                                console.log("copyed: ", url.href);
                                navigator.clipboard.writeText(url.href);

                                ele.setText("已复制");
                                await delayPromise(1300);
                                ele.setText("复制链接");
                            })
                        ],
                        ele =>
                        {
                            context.streamIncomeEvent.addOnce(() =>
                            {
                                ele.remove();
                                initTelephoneMenu();
                            });
                        }
                    ]));

                })
            ] : [
                "请等待...",
                async (ele) =>
                {
                    context.streamIncomeEvent.addOnce(() =>
                    {
                        ele.remove();
                        initTelephoneMenu();
                    });

                    ele.setText("正在连接中转服务...");

                    if (!context.inited)
                        await context.initEvent.oncePromise();

                    if (context.peerErrorInfo && !context.peerId)
                    {
                        let infoEle = NList.getElement([
                            [
                                "连接错误:",
                            ],
                            [
                                context.peerErrorInfo
                            ]
                        ]);
                        cardLoc.insBefore(infoEle);
                        ele.remove();
                        return;
                    }

                    if (!context.localAudioStream)
                    {
                        let infoEle = NList.getElement([
                            [
                                "无法获取本地音频流",
                            ],
                            [
                                "请检查麦克风权限",
                            ]
                        ]);
                        cardLoc.insBefore(infoEle);
                        ele.remove();
                        return;
                    }

                    ele.setText("正在连接对端...");

                    if (context.cPeerUnavailable)
                        ele.setText("对端已离线");
                    context.cPeerUnavailableEvent.addOnce(() =>
                    {
                        ele.setText("对端已离线");
                    });
                }
            ]),

            cardLoc
        ]
    ]));

    body.addChild(NList.getElement([
        styles({
            right: "0",
            bottom: "0",
            position: "fixed",
            fontSize: "0.9em"
        }),

        [
            nTagName.a,
            new NAttr("href", "https://github.com/qwq0/simpleTelephone"),
            styles({
                color: "rgb(0, 0, 0)",
                textShadow: "1px 1px 1px rgba(255, 255, 255, 0.3)"
            }),
            "@qwq0/simpleTelephone"
        ]
    ]));
}

export function initTelephoneMenu()
{
    let micMuted = false;
    let loudspeakerMuted = false;

    let startTime = Math.floor(performance.now());
    context.streamIncomeEvent.add(() =>
    {
        startTime = Math.floor(performance.now());
    });

    cardLoc.insBefore(NList.getElement([
        styles({
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "space-evenly",
            gap: "10px"
        }),
        [
            styles({
                width: "fit-content",
                whiteSpace: "pre-wrap",
                fontSize: "11px",
                color: "rgba(30, 30, 30, 0.8)"
            }),
            "- 正在通话 -",
            ele =>
            {
                context.streamIncomeEvent.add(() =>
                {
                    ele.setText("- 正在通话 -");
                });
                context.disconnectEvent.add(() =>
                {
                    ele.setText("- 通话结束 -");
                });
            }
        ],
        [
            styles({
                width: "fit-content",
                whiteSpace: "pre-wrap",
                fontSize: "11px",
                color: "rgba(30, 30, 30, 0.8)"
            }),
            "00:00",
            ele =>
            {
                setInterval(() =>
                {
                    if (!context.hasStream)
                        return;
                    let nowTime = performance.now();
                    let second = Math.floor((nowTime - startTime) / 1000);
                    let minutes = Math.floor(second / 60);
                    second %= 60;
                    let hours = Math.floor(minutes / 60);
                    minutes %= 60;
                    let textTime = "00:00";
                    textTime = (hours > 0 ? (hours.toString() + ":") : "") + minutes.toString().padStart(2, "0") + ":" + second.toString().padStart(2, "0");
                    ele.setText(textTime);
                }, 1000);
            }
        ],
        [
            styles({
                height: "40px",
                width: "140px",
                borderRadius: "5px",
                color: "rgb(255, 255, 255)",
                fontSize: "1em",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }),
            "关闭麦克风",
            getHoverAsse({
                backgroundColor: "rgb(190, 130, 130)",
            }, {
                backgroundColor: "rgb(170, 120, 120)",
            }),
            eventName.click(async (e, ele) =>
            {
                micMuted = !micMuted;
                ele.setText(micMuted ? "打开麦克风" : "关闭麦克风");
                context.localAudioStream.getAudioTracks().forEach(o =>
                {
                    o.enabled = !micMuted;
                });
            })
        ],
        [
            styles({
                height: "40px",
                width: "140px",
                borderRadius: "5px",
                color: "rgb(255, 255, 255)",
                fontSize: "1em",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }),
            "关闭扬声器",
            getHoverAsse({
                backgroundColor: "rgb(130, 130, 130)",
            }, {
                backgroundColor: "rgb(120, 120, 120)",
            }),
            eventName.click(async (e, ele) =>
            {
                loudspeakerMuted = !loudspeakerMuted;
                ele.setText(loudspeakerMuted ? "打开扬声器" : "关闭扬声器");
                audio.volume = (loudspeakerMuted ? 0 : 1);
            })
        ]
    ]));
}