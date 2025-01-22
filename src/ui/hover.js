import { NElement, NEvent } from "../../lib/qwqframe.js";
/**
 * 创建悬停动画
 * @param {Object} idleStyle
 * @param {Object} hoverStyle
 * @returns {(ele: NElement) => void}
 */
export function getHoverAsse(idleStyle, hoverStyle)
{
    return (ele) =>
    {
        ele.setStyles(idleStyle);
        ele.addEventListener("mouseenter", () =>
        {
            ele.animateCommit([
                {
                    ...idleStyle
                },
                {
                    ...hoverStyle
                }
            ], {
                duration: 175,
                easing: "cubic-bezier(0.61, 1, 0.88, 1)"
            });
        });
        ele.addEventListener("mouseleave", () =>
        {
            ele.animateCommit([
                {
                    ...hoverStyle
                },
                {
                    ...idleStyle
                }
            ], {
                duration: 175,
                easing: "cubic-bezier(0.61, 1, 0.88, 1)"
            });
        });
    };
}