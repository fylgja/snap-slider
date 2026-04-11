(() => {
  // src/snap-slider.js
  var SnapSlider = class {
    constructor(el, { labelSepparator = "of", autoPager, groupPager, loop } = {}) {
      this.el = el;
      this.track = this.el.querySelector("[data-track]");
      if (!this.track) {
        console.warn(
          "No Slider track defined, reverting back to CSS slider.\nPlease create a wrapper for your slides with the attribute data-track",
          this.el
        );
        return;
      }
      this.initialLoad = true;
      this.slides = [];
      this.inViewObserver;
      this.mutationObserver;
      this.resizeObserver;
      this.pager = this.el.querySelector("[data-pager]");
      this.navBtns = Array.from(
        this.el.querySelectorAll("[data-next], [data-prev]")
      );
      this.slideLabelSepparator = this.el.dataset.slideLabelSepparator || labelSepparator;
      this.useAutoPager = autoPager || this.el.hasAttribute("data-auto-pager") || false;
      this.useGroupPager = groupPager || this.el.hasAttribute("data-group-pager") || false;
      this.useLoop = loop || this.el.hasAttribute("data-loop") || false;
      this.sliderLabel = this.el.hasAttribute("aria-label") && this.el.getAttribute("aria-label").toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
      this.sliderId = this.el.id || this.sliderLabel || "slider";
      this.markerIdName = "data-target-id";
      this.pagerClasses = this.el.dataset.pagerClass || "snap-pager";
      this.markerClasses = this.el.dataset.markerClass || "snap-marker";
      this.init();
    }
    init() {
      this.setupSlides();
      this.setupNav();
      if (this.useAutoPager) {
        this.createPager();
      } else {
        this.setupPager();
      }
      this.setupObservers();
      this.setupMutationObserver();
      this.setupResizeObserver();
      this.el.addEventListener("click", this.eventHandler.bind(this));
      this.el.addEventListener("keydown", this.eventHandler.bind(this));
    }
    destroy() {
      this.inViewObserver?.disconnect();
      this.mutationObserver?.disconnect();
      this.resizeObserver?.disconnect();
      this.el.removeEventListener("click", this.eventHandler.bind(this));
      this.el.removeEventListener("keydown", this.eventHandler.bind(this));
    }
    roundUpIfGreaterThan(number, min = 8) {
      const decimalPart = number - Math.floor(number);
      return decimalPart >= min ? Math.ceil(number) : Math.floor(number);
    }
    getInViewItems() {
      const inViewSlides = this.track.querySelectorAll("[data-in-view]");
      const firstInViewSlide = inViewSlides[0] || null;
      const lastInViewSlide = inViewSlides[inViewSlides.length - 1] || null;
      const isAtStart = firstInViewSlide === this.slides[0];
      const isAtEnd = lastInViewSlide === this.slides[this.slides.length - 1];
      return {
        inViewSlides,
        totalInViewSlides: inViewSlides.length,
        firstInViewSlide,
        lastInViewSlide,
        isAtStart,
        isAtEnd,
        hasNoOverflow: isAtStart && isAtEnd
      };
    }
    groupPagerMarkers() {
      if (this.slides.length === 0 || !this.pager || !this.useGroupPager)
        return;
      const totalVisibleSlides = this.roundUpIfGreaterThan(
        this.track.offsetWidth / this.slides[0].offsetWidth
      );
      const markers = Array.from(this.pager.querySelectorAll("a, button"));
      markers.forEach((marker, index) => {
        marker.style.display = index % totalVisibleSlides === 0 ? null : "none";
      });
    }
    handleInView(entries) {
      entries.forEach((entry) => {
        const marker = this.pager && (this.pager.querySelector(`[href="#${entry.target.id}"]`) || this.pager.querySelector(
          `[${this.markerIdName}="${entry.target.id}"]`
        ));
        entry.target.toggleAttribute("data-in-view", entry.isIntersecting);
        entry.target.toggleAttribute("inert", !entry.isIntersecting);
        marker?.setAttribute("aria-current", entry.isIntersecting);
        marker?.setAttribute("tabindex", entry.isIntersecting ? "0" : "-1");
      });
      const { isAtStart, isAtEnd, hasNoOverflow } = this.getInViewItems();
      this.navBtns.forEach((btn) => {
        if (btn.hasAttribute("data-next")) {
          btn.style.visibility = hasNoOverflow ? "hidden" : null;
          isAtEnd && !this.useLoop ? btn.setAttribute("disabled", "") : btn.removeAttribute("disabled");
        }
        if (btn.hasAttribute("data-prev")) {
          btn.style.visibility = hasNoOverflow ? "hidden" : null;
          isAtStart && !this.useLoop ? btn.setAttribute("disabled", "") : btn.removeAttribute("disabled");
        }
      });
      if (this.pager) {
        this.pager.style.visibility = hasNoOverflow ? "hidden" : null;
      }
      if (!this.initialLoad) {
        this.el.dispatchEvent(
          new CustomEvent("slideChange", {
            detail: this.getInViewItems()
          })
        );
      } else {
        this.initialLoad = false;
      }
      if (document.activeElement.parentElement.hasAttribute("data-pager")) {
        const activeItems = this.pager.querySelectorAll('[tabindex="0"]');
        if (activeItems.length) {
          activeItems[0].focus({ preventScroll: true });
        }
      }
    }
    getSlides() {
      if (!this.track) return [];
      return Array.from(this.track.children).filter(
        (child) => child.tagName.toLowerCase() !== "template" && child.tagName.toLowerCase() !== "style" && child.tagName.toLowerCase() !== "script"
      );
    }
    refreshSlides() {
      this.initialLoad = true;
      this.slides = this.getSlides();
      this.setupSlides();
      if (this.useAutoPager) {
        this.createPager();
      } else {
        this.setupPager();
      }
      this.groupPagerMarkers();
      this.setupObservers();
    }
    setupSlides() {
      this.slides = this.getSlides();
      this.slides.forEach((slide, index) => {
        const totalSlides = this.slides.length;
        const currentSlide = index + 1;
        const existingLabel = slide.getAttribute("aria-label") || "";
        const isImage = slide.tagName.toLowerCase() === "img" || slide.tagName.toLowerCase() === "picture";
        const slideLabelTag = isImage ? "alt" : "aria-label";
        const hasAutoLabel = existingLabel.startsWith(
          `${currentSlide} ${this.slideLabelSepparator} `
        );
        if (!slide.hasAttribute("id")) {
          slide.setAttribute(
            "id",
            `${this.sliderId}-item-${currentSlide}`
          );
        }
        if (!slide.hasAttribute(slideLabelTag) || slide.getAttribute(slideLabelTag) === "" || hasAutoLabel) {
          slide.setAttribute(
            slideLabelTag,
            `${currentSlide} ${this.slideLabelSepparator} ${totalSlides}`
          );
        }
        if (slide.tagName.toLowerCase() === "div" && !slide.hasAttribute("role")) {
          slide.setAttribute("role", "group");
        }
        if (this.pager && !isImage) {
          slide.setAttribute("role", "tabpanel");
        }
        if (slide.getAttribute("role") === "group") {
          slide.setAttribute("aria-roledescription", "item");
        }
      });
      if (!this.el.hasAttribute("role") && this.el.tagName !== "SECTION") {
        this.el.setAttribute("role", "region");
      }
      if (!this.el.hasAttribute("aria-roledescription")) {
        this.el.setAttribute("aria-roledescription", "carousel");
      }
      this.track.setAttribute("tabindex", 0);
      this.track.setAttribute("aria-live", "polite");
    }
    setupNav() {
      this.navBtns.forEach((btn) => {
        btn.setAttribute("disabled", "");
        btn.removeAttribute("hidden");
        btn.classList.remove("invisible");
        btn.style.visibility = null;
      });
    }
    createPager() {
      const newPager = document.createElement("nav");
      newPager.setAttribute("data-pager", "");
      newPager.setAttribute("role", "tablist");
      newPager.classList.add(...this.pagerClasses.split(" "));
      this.slides.forEach((slide, index) => {
        const marker = document.createElement("button");
        const slideId = slide.id || `${this.sliderId}-item-${index + 1}`;
        marker.setAttribute(this.markerIdName, slideId);
        marker.classList.add(...this.markerClasses.split(" "));
        this.setupPagerMarker(marker, index);
        newPager.appendChild(marker);
        if (slide.tagName.toLowerCase() !== "img" && slide.tagName.toLowerCase() !== "picture") {
          slide.removeAttribute("aria-roledescription");
          slide.setAttribute("role", "tabpanel");
        }
      });
      if (this.pager) {
        this.pager.setAttribute("role", "tablist");
        this.pager.replaceChildren(...newPager.children);
      } else {
        this.track.after(newPager);
        this.pager = this.el.querySelector("[data-pager]");
      }
    }
    setupPager() {
      if (!this.pager) return;
      this.pager.setAttribute("role", "tablist");
      const items = Array.from(this.pager.querySelectorAll("a, button"));
      items.forEach((marker, index) => this.setupPagerMarker(marker, index));
    }
    setupPagerMarker(marker, index) {
      const markerId = marker.getAttribute("href")?.slice(1) || marker.getAttribute(this.markerIdName);
      const slideId = markerId || `${this.sliderId}-item-${index + 1}`;
      if (!markerId) {
        marker.setAttribute(this.markerIdName, slideId);
      }
      marker.setAttribute("role", "tab");
      marker.setAttribute("aria-controls", slideId);
      marker.setAttribute("aria-posinset", index + 1);
      marker.setAttribute("aria-setsize", this.slides.length);
      marker.setAttribute("tabindex", "-1");
      if (!marker.hasAttribute("aria-label")) {
        marker.setAttribute("aria-label", `Slide ${index + 1}`);
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
          threshold: 0.8
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
        this.groupPagerMarkers.bind(this)
      );
      this.resizeObserver.observe(this.el);
    }
    goToSlideDir(dir = "next") {
      const { firstInViewSlide, lastInViewSlide } = this.getInViewItems();
      const isPrev = dir === "prev";
      let targetSlide = isPrev ? firstInViewSlide?.previousElementSibling : lastInViewSlide?.nextElementSibling;
      if (!targetSlide && this.useLoop) {
        targetSlide = isPrev ? this.slides[this.slides.length - 1] : this.slides[0];
      }
      if (!targetSlide) return;
      if (targetSlide.tagName.toLowerCase() === "template") {
        targetSlide = isPrev ? targetSlide?.previousElementSibling : targetSlide?.nextElementSibling;
      }
      targetSlide.scrollIntoView({
        block: "nearest",
        inline: isPrev ? "end" : "start"
      });
    }
    pagerToSlide(event) {
      if (!event.target.closest("[data-pager]")) return;
      const marker = event.target.closest("a, button");
      if (!marker) return;
      event.preventDefault();
      const slideId = marker.getAttribute("href")?.slice(1) || marker.getAttribute(this.markerIdName);
      const targetSlide = this.track.querySelector(`#${slideId}`);
      targetSlide?.scrollIntoView({ block: "nearest", inline: "start" });
    }
    eventHandler(event) {
      const target = event.target.closest(
        "[data-next], [data-prev], [data-pager]"
      );
      if (!target) return;
      if (event.type === "click") {
        if (target.hasAttribute("data-next")) {
          this.goToSlideDir("next");
        } else if (target.hasAttribute("data-prev")) {
          this.goToSlideDir("prev");
        } else if (target.closest("[data-pager]")) {
          this.pagerToSlide(event);
        }
      }
      if (event.type === "keydown" && target.closest("[data-pager]")) {
        if (event.key === "ArrowRight") {
          this.goToSlideDir("next");
        } else if (event.key === "ArrowLeft") {
          this.goToSlideDir("prev");
        }
      }
    }
  };

  // src/alpine/cdn.js
  function alpineSnapSlider(Alpine) {
    Alpine.directive("snap-slider", (el, { modifiers }, { cleanup }) => {
      const slider = new SnapSlider(el, {
        autoPager: modifiers.includes("auto-pager"),
        groupPager: modifiers.includes("group-pager"),
        loop: modifiers.includes("loop")
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
})();
