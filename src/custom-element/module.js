import { SnapSlider } from "../snap-slider.js";

class SnapSliderElement extends HTMLElement {
    constructor() {
        super();
        this.slider = null;
    }

    connectedCallback() {
        this.slider = new SnapSlider(this);
    }

    disconnectedCallback() {
        if (this.slider) {
            this.slider.destroy();
        }
    }
}

customElements.define("snap-slider", SnapSliderElement);
