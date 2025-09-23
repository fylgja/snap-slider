import { SnapSlider } from "../snap-slider.js";

function alpineSnapSlider(Alpine) {
    Alpine.directive("snap-slider", (el, { modifiers }, { cleanup }) => {
        const autoPager = modifiers.includes("auto-pager");
        const groupPager = modifiers.includes("group-pager");
        const slider = new SnapSlider(el, { autoPager, groupPager });

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
