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

export default customElements.define("snap-slider", SnapSliderElement);
