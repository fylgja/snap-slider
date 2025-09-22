import { SnapSlider } from "../snap-slider.js";

export default function alpineSnapSlider(Alpine) {
    Alpine.directive("snap-slider", (el, { modifiers }, { cleanup }) => {
        const autoPager = modifiers.includes("auto-pager");
        const groupPager = modifiers.includes("group-pager");
        const slider = new SnapSlider(el, { autoPager, groupPager });

        cleanup(() => {
            slider.destroy();
        });
    });
}
