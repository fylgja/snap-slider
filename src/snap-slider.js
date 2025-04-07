const SnapSlider = class extends HTMLElement {
    constructor() {
        super();
        this.track = null;
        this.pager = null;
        this.slides = [];
        this.inViewObserver = null;
        this.mutationObserver = null;
        this.resizeObserver = null;
        this.navBtns = [];
        this.initialLoad = true;
        this.slideLabelSepparator = this.dataset.slideLabelSepparator || "of";
        this.useAutoPager = this.hasAttribute("data-auto-pager");
        this.sliderLabel = this.getAttribute("aria-label")
            ?.toLowerCase()
            .trim()
            .replace(/[^a-z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        this.sliderId = this.id || this.sliderLabel || "slider";
        this.markerIdName = "data-target-id";
        this.pagerClasses = this.dataset.pagerClass || "pager";
        this.markerClasses = this.dataset.markerClass || "pager-item";
    }

    connectedCallback() {
        this.track = this.querySelector("[data-track]");
        if (!this.track) {
            console.warn(
                "No Slider track defined, reverting back to CSS slider.\nPlease create a wrapper element for your slides with the attribute data-track"
            );
            return;
        }
        this.pager = this.querySelector("[data-pager]");
        this.navBtns = Array.from(
            this.querySelectorAll("[data-next], [data-prev]")
        );
        this.refreshSlides();
        this.setupNav();
        this.setupEventListeners();
        this.setupMutationObserver();
        this.setupResizeObserver();
    }

    disconnectedCallback() {
        this.inViewObserver?.disconnect();
        this.mutationObserver?.disconnect();
        this.resizeObserver?.disconnect();
        this.removeEventListeners();
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
            hasNoOverflow: isAtStart && isAtEnd,
        };
    }

    groupPagerMarkers() {
        if (!this.pager) return;
        const totalVisibleSlides = this.roundUpIfGreaterThan(
            this.track.offsetWidth / this.slides[0].offsetWidth
        );

        const markers = Array.from(this.pager.querySelectorAll("a, button"));
        markers.forEach((marker, index) => {
            marker.style.display =
                index % totalVisibleSlides === 0 ? null : "none";
        });
    }

    handleInView(entries) {
        entries.forEach((entry) => {
            const marker =
                this.pager &&
                (this.pager.querySelector(`[href="#${entry.target.id}"]`) ||
                    this.pager.querySelector(
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
                isAtEnd
                    ? btn.setAttribute("disabled", "")
                    : btn.removeAttribute("disabled");
            }

            if (btn.hasAttribute("data-prev")) {
                btn.style.visibility = hasNoOverflow ? "hidden" : null;
                isAtStart
                    ? btn.setAttribute("disabled", "")
                    : btn.removeAttribute("disabled");
            }
        });

        if (this.pager) {
            this.pager.style.visibility = hasNoOverflow ? "hidden" : null;
        }

        if (!this.initialLoad) {
            this.dispatchEvent(
                new CustomEvent("slideChange", {
                    detail: this.getInViewItems(),
                })
            );
        } else {
            this.initialLoad = false;
        }

        if (document.activeElement?.parentElement?.hasAttribute("data-pager")) {
            const activeItems = this.pager.querySelectorAll('[tabindex="0"]');
            if (activeItems.length) {
                activeItems[0].focus();
            }
        }
    }

    getSlides() {
        if (!this.track) return [];
        return Array.from(this.track.children).filter(
            (child) => child.tagName.toLowerCase() !== "template"
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
        this.slides.forEach((slide, index) => {
            const totalSlides = this.slides.length;
            const currentSlide = index + 1;
            const existingLabel = slide.getAttribute("aria-label") || "";
            const hasAutoLabel = existingLabel.startsWith(
                `${currentSlide} ${this.slideLabelSepparator} `
            );
            slide.setAttribute("aria-roledescription", "item");

            if (!slide.hasAttribute("id")) {
                slide.setAttribute(
                    "id",
                    `${this.sliderId}-item-${currentSlide}`
                );
            }

            if (!slide.hasAttribute("aria-label") || hasAutoLabel) {
                slide.setAttribute(
                    "aria-label",
                    `${currentSlide} ${this.slideLabelSepparator} ${totalSlides}`
                );
            }

            if (!slide.hasAttribute("role")) {
                slide.setAttribute("role", "group");
            }
        });

        if (!this.hasAttribute("role")) {
            this.setAttribute("role", "region");
        }

        if (!this.hasAttribute("aria-roledescription")) {
            this.setAttribute("aria-roledescription", "carousel");
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
        });

        if (this.pager) {
            this.track.setAttribute("role", "tabpanel");
            this.track.removeAttribute("aria-roledescription");
            this.pager.setAttribute("role", "tablist");
            this.pager.replaceChildren(...newPager.children);
        } else {
            this.track.after(newPager);
            this.pager = this.querySelector("[data-pager]");
        }
    }

    setupPager() {
        if (!this.pager) return;
        this.track.setAttribute("role", "tabpanel");
        this.track.removeAttribute("aria-roledescription");
        this.pager.setAttribute("role", "tablist");
        const items = Array.from(this.pager.querySelectorAll("a, button"));
        items.forEach((marker, index) => this.setupPagerMarker(marker, index));
    }

    setupPagerMarker(marker, index) {
        const markerId =
            marker.getAttribute("href")?.slice(1) ||
            marker.getAttribute(this.markerIdName);
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
            { root: this.track, threshold: 0.8 }
        );
        this.slides.forEach((slide) => this.inViewObserver.observe(slide));
    }

    setupMutationObserver() {
        this.mutationObserver = new MutationObserver(
            this.refreshSlides.bind(this)
        );
        this.mutationObserver.observe(this.track, {
            childList: true,
            subtree: false,
        });
    }

    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(
            this.groupPagerMarkers.bind(this)
        );
        this.resizeObserver.observe(this);
    }

    goToSlideDir(dir = "next") {
        const { firstInViewSlide, lastInViewSlide } = this.getInViewItems();
        const isPrev = dir === "prev";
        let targetSlide = isPrev
            ? firstInViewSlide?.previousElementSibling
            : lastInViewSlide?.nextElementSibling;

        if (!targetSlide) return;

        if (targetSlide.tagName.toLowerCase() === "template") {
            targetSlide = isPrev
                ? targetSlide?.previousElementSibling
                : targetSlide?.nextElementSibling;
        }

        targetSlide.scrollIntoView({
            block: "nearest",
            inline: isPrev ? "end" : "start",
            behavior: "smooth",
        });
    }

    pagerToSlide(event) {
        if (!event.target.closest("[data-pager]")) return;
        const marker = event.target.closest("a, button");
        if (!marker) return;

        event.preventDefault();
        const slideId =
            marker.getAttribute("href")?.slice(1) ||
            marker.getAttribute(this.markerIdName);
        const targetSlide = this.track.querySelector(`#${slideId}`);
        targetSlide?.scrollIntoView({
            block: "nearest",
            inline: "start",
            behavior: "smooth",
        });
    }

    setupEventListeners() {
        this.eventHandler = this.eventHandler.bind(this);
        this.addEventListener("click", this.eventHandler);
        this.addEventListener("keydown", this.eventHandler);
    }

    removeEventListeners() {
        this.removeEventListener("click", this.eventHandler);
        this.removeEventListener("keydown", this.eventHandler);
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

export default SnapSlider;
