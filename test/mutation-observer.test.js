import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SnapSlider } from "../src/snap-slider.js";

/**
 * Waits for the MutationObserver callbacks to be delivered.
 * @returns {Promise<void>}
 */
const flushMutations = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Builds a slider with three slides, each holding a nested element.
 * @param {object} [options] Options passed to the SnapSlider constructor.
 * @returns {{slider: SnapSlider, track: HTMLElement, refreshSlides: import("vitest").MockInstance}}
 */
function createSlider(options = {}) {
    document.body.innerHTML = `
        <section id="slider" aria-label="Test slider">
            <div data-track>
                <div class="slide"><span class="slide-body"></span></div>
                <div class="slide"><span class="slide-body"></span></div>
                <div class="slide"><span class="slide-body"></span></div>
            </div>
            <nav data-pager></nav>
        </section>
    `;

    const slider = new SnapSlider(document.getElementById("slider"), options);
    const refreshSlides = vi.spyOn(slider, "refreshSlides");

    return { slider, track: slider.track, refreshSlides };
}

/**
 * Creates a slide element the track will accept as a slide.
 * @returns {HTMLElement}
 */
function createSlide() {
    const slide = document.createElement("div");
    slide.classList.add("slide");
    return slide;
}

describe("mutation observer scope", () => {
    let slider;
    let track;
    let refreshSlides;

    beforeEach(() => {
        ({ slider, track, refreshSlides } = createSlider());
    });

    afterEach(() => {
        slider.destroy();
        vi.restoreAllMocks();
    });

    describe("mutations inside a slide", () => {
        it("ignores an inserted element", async () => {
            const tooltip = document.createElement("span");
            tooltip.setAttribute("role", "tooltip");
            track.querySelector(".slide-body").append(tooltip);
            await flushMutations();

            expect(refreshSlides).not.toHaveBeenCalled();
        });

        it("ignores a removed element", async () => {
            const tooltip = document.createElement("span");
            const body = track.querySelector(".slide-body");
            body.append(tooltip);
            await flushMutations();

            tooltip.remove();
            await flushMutations();

            expect(refreshSlides).not.toHaveBeenCalled();
        });

        it("ignores an inline style change", async () => {
            track.querySelector(".slide-body").style.display = "none";
            await flushMutations();

            expect(refreshSlides).not.toHaveBeenCalled();
        });

        it("ignores repeated inserts and removals", async () => {
            const body = track.querySelector(".slide-body");

            for (let i = 0; i < 5; i++) {
                const tooltip = document.createElement("span");
                body.append(tooltip);
                await flushMutations();
                tooltip.remove();
                await flushMutations();
            }

            expect(refreshSlides).not.toHaveBeenCalled();
        });
    });

    describe("mutations on the track", () => {
        it("refreshes when a slide is added", async () => {
            track.append(createSlide());
            await flushMutations();

            expect(refreshSlides).toHaveBeenCalledTimes(1);
            expect(slider.slides).toHaveLength(4);
        });

        it("refreshes when a slide is removed", async () => {
            track.lastElementChild.remove();
            await flushMutations();

            expect(refreshSlides).toHaveBeenCalledTimes(1);
            expect(slider.slides).toHaveLength(2);
        });

        it("refreshes when a slide is hidden with an inline style", async () => {
            track.firstElementChild.style.display = "none";
            await flushMutations();

            expect(refreshSlides).toHaveBeenCalledTimes(1);
            expect(slider.slides).toHaveLength(2);
        });

        it("keeps observing after a refresh", async () => {
            track.append(createSlide());
            await flushMutations();

            track.append(createSlide());
            await flushMutations();

            expect(refreshSlides).toHaveBeenCalledTimes(2);
            expect(slider.slides).toHaveLength(5);
        });

        it("stops observing after destroy", async () => {
            slider.destroy();
            track.append(createSlide());
            await flushMutations();

            expect(refreshSlides).not.toHaveBeenCalled();
        });
    });

    describe("with an auto pager", () => {
        beforeEach(() => {
            slider.destroy();
            ({ slider, track, refreshSlides } = createSlider({
                autoPager: true,
            }));
        });

        it("does not refresh itself when rebuilding the pager", async () => {
            track.append(createSlide());
            await flushMutations();
            await flushMutations();

            expect(refreshSlides).toHaveBeenCalledTimes(1);
            expect(slider.pager.children).toHaveLength(4);
        });
    });
});
