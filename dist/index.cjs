var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/module.js
var module_exports = {};
__export(module_exports, {
  default: () => module_default
});
module.exports = __toCommonJS(module_exports);

// src/snap-slider.js
var _a;
var SnapSlider = (_a = class extends HTMLElement {
  constructor() {
    super();
    this.initialLoad = true;
    this.toPrevSlide = this.toPrevSlide.bind(this);
    this.toNextSlide = this.toNextSlide.bind(this);
    this.pagerClick = this.pagerClick.bind(this);
    this.pagerKeydown = this.pagerKeydown.bind(this);
    this.track = this.querySelector("[data-track]");
    if (!this.track) {
      return console.warn(
        "No Slider track defined, reverting back to CSS slider.\nPlease create a wrapper element for your slides with the attribute data-track"
      );
    }
    this.sliderLabel = this.hasAttribute("aria-label") && this.getAttribute("aria-label").toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
    this.sliderId = this.id || this.sliderLabel || "slider";
    this.prevBtn = this.querySelector("[data-prev]");
    this.nextBtn = this.querySelector("[data-next]");
    this.pager = this.querySelector("[data-pager]");
  }
  connectedCallback() {
    const initOfLabel = this.getAttribute("data-slide-of-label") || this.getAttribute("slide-of-label") || "of";
    const initAutoPager = this.hasAttribute("data-auto-pager") || this.hasAttribute("auto-pager");
    const initGroupPager = this.hasAttribute("data-group-pager") || this.hasAttribute("group-pager");
    this.inViewObserver = null;
    this.mutationObserver = null;
    this.resizeObserver = null;
    this.options = {
      initOfText: initOfLabel,
      ofText: initOfLabel,
      autoPager: initAutoPager,
      groupPager: initGroupPager || initAutoPager
    };
    this.slides = this.getSlides();
    if (this.options.autoPager) {
      this.createPager();
      this.pager = this.querySelector("[data-pager]");
    } else if (this.pager) {
      this.setupPager();
    }
    if (this.pager) {
      this.track.setAttribute("role", "tabpanel");
      this.track.removeAttribute("aria-roledescription");
      this.pager.addEventListener("click", this.pagerClick);
      this.pager.addEventListener("keydown", this.pagerKeydown);
      if (this.options.groupPager) {
        this.setupResizeObserver();
      }
    }
    this.setupWrapper();
    this.setupSlides();
    this.setupNavButtons();
    this.setupObservers();
    this.setupMutationObserver();
  }
  disconnectedCallback() {
    if (this.inViewObserver) {
      this.inViewObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.prevBtn) {
      this.prevBtn.removeEventListener("click", this.toPrevSlide);
    }
    if (this.nextBtn) {
      this.nextBtn.removeEventListener("click", this.toNextSlide);
    }
    if (this.pager) {
      this.pager.removeEventListener("click", this.pagerClick);
      this.pager.removeEventListener("keydown", this.pagerKeydown);
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === null) return;
    if (name === "data-slide-of-label" || name === "slide-of-label") {
      this.options.initOfText = oldValue;
      this.options.ofText = newValue;
      this.setupSlides();
    }
  }
  setupObservers() {
    if (this.inViewObserver) {
      this.inViewObserver.disconnect();
    }
    this.inViewObserver = new IntersectionObserver(
      this.handleInView.bind(this),
      {
        root: this.track,
        threshold: 0.5
      }
    );
    this.slides.forEach((slide) => this.inViewObserver.observe(slide));
  }
  setupMutationObserver() {
    this.mutationObserver = new MutationObserver(
      this.refreshSlides.bind(this)
    );
    this.mutationObserver.observe(this.track, {
      childList: true,
      subtree: false
    });
  }
  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(
      this.groupPagerLinks.bind(this)
    );
    this.resizeObserver.observe(this);
  }
  setupWrapper() {
    const isInline = getComputedStyle(this).display === "inline";
    if (isInline) {
      this.style.display = "block";
    }
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
  setupSlides() {
    this.slides.forEach((slide, index) => {
      const { initOfText, ofText } = this.options;
      const totalSlides = this.slides.length;
      const currentSlide = index + 1;
      const existingLabel = slide.getAttribute("aria-label") || "";
      const hasAutoLabel = existingLabel.startsWith(
        `${currentSlide} ${initOfText} `
      );
      slide.setAttribute("aria-roledescription", "item");
      if (!slide.hasAttribute("id") && this.pager) {
        slide.setAttribute(
          "id",
          `${this.sliderId}-item-${currentSlide}`
        );
      }
      if (!slide.hasAttribute("aria-label") || hasAutoLabel) {
        slide.setAttribute(
          "aria-label",
          `${currentSlide} ${ofText} ${totalSlides}`
        );
      }
    });
  }
  setupNavButtons() {
    if (!this.prevBtn || !this.nextBtn) return;
    this.prevBtn.removeAttribute("hidden");
    this.nextBtn.removeAttribute("hidden");
    this.prevBtn.addEventListener("click", this.toPrevSlide);
    this.nextBtn.addEventListener("click", this.toNextSlide);
  }
  getSlides() {
    if (!this.track) return [];
    return Array.from(this.track.children).filter(
      (child) => child.tagName.toLowerCase() !== "template"
    );
  }
  getInViewItems() {
    const inViewSlides = this.track.querySelectorAll("[data-in-view]");
    const firstInViewSlide = inViewSlides[0] || null;
    const lastInViewSlide = inViewSlides[inViewSlides.length - 1] || null;
    const isAtStart = firstInViewSlide === this.slides[0];
    const isAtEnd = lastInViewSlide === this.slides[this.slides.length - 1];
    const hasNoOverflow = isAtStart && isAtEnd;
    return {
      inViewSlides,
      totalInViewSlides: inViewSlides.length,
      firstInViewSlide,
      lastInViewSlide,
      isAtStart,
      isAtEnd,
      hasNoOverflow
    };
  }
  checkSliderBounds() {
    const { isAtStart, isAtEnd, hasNoOverflow } = this.getInViewItems();
    if (this.nextBtn) {
      this.nextBtn.style.visibility = hasNoOverflow ? "hidden" : null;
      isAtEnd ? this.nextBtn.setAttribute("disabled", "") : this.nextBtn.removeAttribute("disabled");
    }
    if (this.prevBtn) {
      this.prevBtn.style.visibility = hasNoOverflow ? "hidden" : null;
      isAtStart ? this.prevBtn.setAttribute("disabled", "") : this.prevBtn.removeAttribute("disabled");
    }
    if (this.pager) {
      this.pager.style.visibility = hasNoOverflow ? "hidden" : null;
    }
  }
  slideChange() {
    this.dispatchEvent(
      new CustomEvent("slideChange", { detail: this.getInViewItems() })
    );
  }
  handleInView(entries) {
    entries.forEach((entry) => {
      const marker = this.pager && (this.pager.querySelector(`[href="#${entry.target.id}"]`) || this.pager.querySelector(
        `[data-slide-id="${entry.target.id}"]`
      ));
      if (entry.isIntersecting) {
        entry.target.setAttribute("data-in-view", "");
        entry.target.removeAttribute("inert", "");
        marker == null ? void 0 : marker.setAttribute("aria-current", "true");
        marker == null ? void 0 : marker.setAttribute("tabindex", "0");
      } else {
        entry.target.removeAttribute("data-in-view");
        entry.target.setAttribute("inert", "");
        marker == null ? void 0 : marker.setAttribute("aria-current", "false");
        marker == null ? void 0 : marker.setAttribute("tabindex", "-1");
      }
    });
    this.checkSliderBounds();
    if (!this.initialLoad) {
      this.slideChange();
    } else {
      this.initialLoad = false;
    }
    if (document.activeElement.parentElement.hasAttribute("data-pager")) {
      const activeItems = this.pager.querySelectorAll('[tabindex="0"]');
      if (activeItems.length) {
        activeItems[0].focus();
      }
    }
  }
  refreshSlides() {
    this.initialLoad = true;
    this.slides = this.getSlides();
    if (this.options.autoPager) {
      this.createPager();
      this.groupPagerLinks();
    } else if (this.pager) {
      this.setupPager();
    }
    this.setupSlides();
    this.setupObservers();
  }
  toNextSlide() {
    const { lastInViewSlide } = this.getInViewItems();
    const targetSlide = lastInViewSlide == null ? void 0 : lastInViewSlide.nextElementSibling;
    targetSlide == null ? void 0 : targetSlide.scrollIntoView({
      block: "nearest",
      inline: "start",
      behavior: "smooth"
    });
  }
  toPrevSlide() {
    const { firstInViewSlide } = this.getInViewItems();
    const targetSlide = firstInViewSlide == null ? void 0 : firstInViewSlide.previousElementSibling;
    targetSlide == null ? void 0 : targetSlide.scrollIntoView({
      block: "nearest",
      inline: "end",
      behavior: "smooth"
    });
  }
  createPager() {
    const pager = document.createElement("nav");
    pager.setAttribute("data-pager", "");
    pager.setAttribute("role", "tablist");
    pager.classList.add("pager");
    this.slides.forEach((slide, index) => {
      const marker = document.createElement("button");
      const slideId = slide.id || `${this.sliderId}-item-${index + 1}`;
      marker.setAttribute("data-slide-id", slideId);
      this.setupPagerMarker(marker, index);
      pager.appendChild(marker);
    });
    if (this.pager) {
      this.pager.setAttribute("role", "tablist");
      this.pager.replaceChildren(...pager.children);
    } else {
      this.appendChild(pager);
    }
  }
  removePager() {
    this.pager.replaceChildren();
  }
  setupPager() {
    this.pager.setAttribute("role", "tablist");
    const items = Array.from(this.pager.querySelectorAll("a, button"));
    items.forEach((marker, index) => this.setupPagerMarker(marker, index));
  }
  setupPagerMarker(marker, index) {
    var _a2;
    const slideId = ((_a2 = marker.getAttribute("href")) == null ? void 0 : _a2.slice(1)) || marker.getAttribute("data-slide-id");
    marker.setAttribute("role", "tab");
    marker.setAttribute("aria-controls", slideId);
    marker.setAttribute("aria-posinset", index + 1);
    marker.setAttribute("aria-setsize", this.slides.length);
    marker.setAttribute("tabindex", "-1");
    if (!marker.hasAttribute("aria-label")) {
      marker.setAttribute("aria-label", `Slide ${index + 1}`);
    }
  }
  groupPagerLinks() {
    const totalVisibleSlides = Math.round(
      this.clientWidth / this.slides[0].clientWidth
    );
    const pagerLinks = Array.from(this.pager.querySelectorAll("a, button"));
    pagerLinks.forEach((link, index) => {
      link.style.display = index % totalVisibleSlides === 0 ? null : "none";
    });
  }
  pagerClick(event) {
    var _a2;
    const marker = event.target.closest("a, button");
    if (!marker) return;
    event.preventDefault();
    const slideId = ((_a2 = marker.getAttribute("href")) == null ? void 0 : _a2.slice(1)) || marker.getAttribute("data-slide-id");
    const targetSlide = this.track.querySelector(`#${slideId}`);
    targetSlide == null ? void 0 : targetSlide.scrollIntoView({
      block: "nearest",
      inline: "start",
      behavior: "smooth"
    });
  }
  pagerKeydown(event) {
    if (event.key === "ArrowRight") {
      this.toNextSlide();
    } else if (event.key === "ArrowLeft") {
      this.toPrevSlide();
    }
  }
}, __publicField(_a, "observedAttributes", ["data-slide-of-label", "slide-of-label"]), _a);
var snap_slider_default = SnapSlider;

// src/module.js
var module_default = customElements.define("snap-slider", snap_slider_default);
