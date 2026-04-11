import { SnapSlider } from "../snap-slider.js";

function alpineSnapSlider(Alpine) {
    Alpine.directive("snap-slider", (el, { modifiers }, { cleanup }) => {
        const slider = new SnapSlider(el, {
            autoPager: modifiers.includes("auto-pager"),
            groupPager: modifiers.includes("group-pager"),
            loop: modifiers.includes("loop"),
        });

        cleanup(() => {
            slider.destroy();
        });
    });
}

(() => {
    document.addEventListener("alpine:init", () => {
        window.Alpine.plugin(alpineSnapSlider);
    });
})();
