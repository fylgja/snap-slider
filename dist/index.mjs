var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/snap-slider.js
var require_snap_slider = __commonJS({
  "src/snap-slider.js"() {
    var SnapSlider = class extends HTMLElement {
      constructor() {
        super();
        this.track = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.pager = null;
        this.slides = [];
      }
      connectedCallback() {
        this.track = this.querySelector("[data-track]");
        this.prevBtn = this.querySelector("[data-prev]");
        this.nextBtn = this.querySelector("[data-next]");
        this.pager = this.querySelector("[data-pager]");
        const useNavCreation = this.getAttribute("use-nav") || this.getAttribute("data-use-nav");
        if (!this.track) {
          console.error(
            "No Slider track defined, please create a wrapper element with the `data-track`"
          );
          return;
        }
        if ((!this.prevBtn || !this.nextBtn) && useNavCreation !== "false") {
          this.generateNavButtons();
        }
        this.slides = Array.from(this.track.children);
        this.setupAriaAttributes();
        this.setupPagerLinks();
        this.setupNavigationButtons();
        this.setupObservers();
        this.setupMutationObserver();
      }
      refreshSlides() {
        this.slides = Array.from(this.track.children);
        this.setupObservers();
        this.updatePager();
      }
      setupAriaAttributes() {
        if (!this.hasAttribute("role")) {
          this.setAttribute("role", "region");
        }
        if (!this.hasAttribute("aria-roledescription")) {
          this.setAttribute("aria-roledescription", "carousel");
        }
        if (!this.track.hasAttribute("role")) {
          this.track.setAttribute("role", "group");
        }
        this.track.setAttribute("tabindex", 0);
        this.track.setAttribute("aria-live", "polite");
      }
      setupObservers() {
        if (this.inViewObserver) {
          this.inViewObserver.disconnect();
        }
        const observerOptions = { root: null, threshold: 0.5 };
        this.inViewObserver = new IntersectionObserver(
          this.handleInView.bind(this),
          observerOptions
        );
        this.slides.forEach((slide, index) => {
          slide.setAttribute("aria-roledescription", "item");
          const totalSlides = this.slides.length;
          const currentSlideNumber = index + 1;
          const ofText = this.getAttribute("aria-slide-of-label") || this.getAttribute("data-aria-slide-of-label") || "of";
          const existingLabel = slide.getAttribute("aria-label") || "";
          if (!slide.hasAttribute("aria-label") || existingLabel.startsWith(`${currentSlideNumber} ${ofText} `)) {
            slide.setAttribute(
              "aria-label",
              `${currentSlideNumber} ${ofText} ${totalSlides}`
            );
          }
          this.inViewObserver.observe(slide);
        });
      }
      setupMutationObserver() {
        const mutationObserver = new MutationObserver(() => {
          this.refreshSlides();
        });
        mutationObserver.observe(this.track, {
          childList: true,
          subtree: false
        });
      }
      handleInView(entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-in-view", "");
            entry.target.removeAttribute("inert", "");
          } else {
            entry.target.removeAttribute("data-in-view");
            entry.target.setAttribute("inert", "");
          }
        });
        this.updatePager();
        this.checkSliderBounds();
      }
      getInViewItems() {
        const inViewSlides = this.track.querySelectorAll("[data-in-view]");
        return {
          length: inViewSlides.length,
          first: inViewSlides[0],
          last: inViewSlides[inViewSlides.length - 1],
          all: inViewSlides
        };
      }
      checkSliderBounds() {
        const { first, last } = this.getInViewItems();
        this.updateButtonState(this.prevBtn, first === this.slides[0]);
        this.updateButtonState(
          this.nextBtn,
          last === this.slides[this.slides.length - 1]
        );
      }
      updateButtonState(button, isDisabled) {
        if (!button) return;
        isDisabled ? button.setAttribute("disabled", "") : button.removeAttribute("disabled");
      }
      setupNavigationButtons() {
        this.prevBtn?.removeAttribute("hidden");
        this.nextBtn?.removeAttribute("hidden");
        this.setupButton(this.prevBtn, "previous");
        this.setupButton(this.nextBtn, "next");
      }
      setupButton(button, direction) {
        if (!button) return;
        button.addEventListener("click", () => {
          const { first, last } = this.getInViewItems();
          const targetSlide = direction === "previous" ? first.previousElementSibling : last.nextElementSibling;
          targetSlide?.scrollIntoView({
            block: "nearest",
            inline: "nearest",
            behavior: "smooth"
          });
        });
      }
      generateNavButtons() {
        const navBtnContainer = document.createElement("div");
        navBtnContainer.classList.add("flex", "align-center", "gap");
        ["prev", "next"].forEach((dir) => {
          const button = document.createElement("button");
          button.setAttribute(`data-${dir}`, "");
          button.setAttribute(
            "aria-label",
            dir === "prev" ? "Previous Slide" : "Next Slide"
          );
          button.textContent = dir === "prev" ? "\u2190" : "\u2192";
          navBtnContainer.appendChild(button);
        });
        this.prevBtn = navBtnContainer.querySelector("[data-prev]");
        this.nextBtn = navBtnContainer.querySelector("[data-next]");
        this.insertAdjacentElement("beforeEnd", navBtnContainer);
      }
      updatePager() {
        if (!this.pager) return;
        const inViewItems = this.getInViewItems().all;
        const pagerLinks = Array.from(this.pager.querySelectorAll("a, button"));
        pagerLinks.forEach((link) => {
          link.setAttribute("aria-current", "false");
          link.setAttribute("tabindex", "-1");
        });
        inViewItems.forEach((visibleSlide) => {
          const slideId = visibleSlide.id;
          pagerLinks.forEach((link) => {
            const linkId = link.getAttribute("href")?.slice(1) || link.getAttribute("data-slide-id");
            if (linkId === slideId) {
              link.setAttribute("aria-current", "true");
              link.setAttribute("tabindex", "0");
            }
          });
        });
      }
      setupPagerLinks() {
        if (!this.pager) return;
        this.track.setAttribute("role", "tabpanel");
        this.track.removeAttribute("aria-roledescription");
        this.pager.setAttribute("role", "tablist");
        const pagerLinks = Array.from(this.pager.querySelectorAll("a, button"));
        pagerLinks.forEach((link, index) => {
          link.setAttribute("role", "tab");
          const slideId = link.getAttribute("href")?.slice(1) || link.getAttribute("data-slide-id");
          link.setAttribute("aria-controls", slideId);
          link.setAttribute("aria-posinset", index + 1);
          link.setAttribute("aria-setsize", this.slides.length);
          if (!link.hasAttribute("aria-label")) {
            link.setAttribute("aria-label", `Slide ${index + 1}`);
          }
        });
        this.pager.addEventListener("click", (e) => {
          const clickedButtonOrLink = e.target.closest("a, button");
          if (!clickedButtonOrLink) return;
          e.preventDefault();
          const slideId = clickedButtonOrLink.getAttribute("href")?.slice(1) || clickedButtonOrLink.getAttribute("data-slide-id");
          const targetSlide = this.track.querySelector(`#${slideId}`);
          if (!targetSlide) return;
          targetSlide.scrollIntoView({
            block: "nearest",
            inline: "nearest",
            behavior: "smooth"
          });
        });
        this.pager.addEventListener("keydown", (e) => {
          const currentActivePagerItem = document.activeElement;
          if (!currentActivePagerItem.parentElement.hasAttribute("data-pager"))
            return;
          const { first, last } = this.getInViewItems();
          let newActivePagerItem;
          let targetSlide;
          if (e.key === "ArrowRight") {
            newActivePagerItem = currentActivePagerItem.nextElementSibling;
            targetSlide = last.nextElementSibling;
          } else if (e.key === "ArrowLeft") {
            newActivePagerItem = currentActivePagerItem.previousElementSibling;
            targetSlide = first.previousElementSibling;
          }
          if (newActivePagerItem) {
            newActivePagerItem.focus();
            targetSlide?.scrollIntoView({
              block: "nearest",
              inline: "nearest",
              behavior: "smooth"
            });
          }
        });
      }
    };
    customElements.define("snap-slider", SnapSlider);
  }
});

// src/module.js
var import_snap_slider = __toESM(require_snap_slider());
var module_default = import_snap_slider.default;
export {
  module_default as default
};
