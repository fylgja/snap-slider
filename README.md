# Fylgja - Snap Slider

[![NPM version](https://img.shields.io/npm/v/@fylgja/snap-slider?logo=npm)](https://www.npmjs.com/package/@fylgja/snap-slider)
[![License](https://img.shields.io/github/license/fylgja/snap-slider?color=%23234)](/LICENSE)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1a127f61-d12b-46cf-858f-65a1350323e7/deploy-status)](https://fylgja-snap-slider.netlify.app/)

A CSS-powered slider/carousel, enhanced with JavaScript for improved functionality and accessibility.

The Snap Slider is available as a Custom Element (the primary and recommended way) or as an AlpineJS component.

**Custom Element Live Demo:** [https://fylgja-snap-slider.netlify.app/](https://fylgja-snap-slider.netlify.app/)
**AlpineJS Live Demo:** [https://fylgja-snap-slider.netlify.app/alpine.html](https://fylgja-snap-slider.netlify.app/alpine.html)

## Installation

The Snap Slider can be integrated into your project via NPM or by using a CDN.

### NPM Installation

Install the package from NPM:

```sh
npm install @fylgja/snap-slider
```

### CDN Integration

Alternatively, you can include the script directly in your HTML using a `<script>` tag.

**For the Custom Element:**

```html
<script defer src="https://unpkg.com/@fylgja/snap-slider/dist/custom-element/cdn.min.js"></script>
```

**For the AlpineJS version:**

```html
<script defer src="https://unpkg.com/@fylgja/snap-slider/dist/alpine/cdn.min.js"></script>
```

## Usage

The Snap Slider can be used as a Custom Element or as an AlpineJS component.

### Custom Element (Recommended)

Import the custom element into your project:

```js
import '@fylgja/snap-slider/custom-element';
```

Then, use the `<snap-slider>` element in your HTML. A `[data-track]` child element is required to contain the slides.

```html
<snap-slider>
    <div data-track>
        <!-- Your slides go here -->
    </div>
</snap-slider>
```

The component enhances accessibility by managing `inert` attributes for off-screen slides and adding ARIA labels.

### AlpineJS Component

To use the AlpineJS version, import the component and register it with Alpine:

```js
import Alpine from 'alpinejs';
import snapSlider from '@fylgja/snap-slider/alpine';

window.Alpine = Alpine;

Alpine.plugin(snapSlider);
Alpine.start();
```

Then, apply the `x-snap-slider` directive to your slider element.

```html
<div x-data x-snap-slider>
    <div data-track>
        <!-- Your slides go here -->
    </div>
</div>
```

### Styling and Functionality

While functional, the slider requires CSS for its visual presentation. The core principle is to leverage CSS for styling, with JavaScript providing progressive enhancements for functionality and accessibility.

You can enhance the slider with navigation buttons and pagination markers using specific data attributes.

### Configuration Options

The `snap-slider` supports the following data attributes:

| Data Attribute           | Description                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| `track`                  | Identifies the container for the slider's slides.                            |
| `next`                   | Triggers navigation to the next slide.                                       |
| `prev`                   | Triggers navigation to the previous slide.                                   |
| `pager`                  | Designates the container for pagination markers.                             |
| `auto-pager`             | Automatically generates pagination markers.                                  |
| `slide-label-sepparator` | Allows customization of the separator used in slide labels (e.g., "1 of *"). |

> [!note]
> All options are implemented via data attributes (e.g., `[data-track]`).

#### Custom Pager Implementation

To create a custom pager, each slide must have a unique ID. These IDs are then linked to pager markers using either anchor links (`href` with a hash) or buttons with the `[data-target-id]` attribute.

The slider intelligently hides pager markers when multiple slides are visible, ensuring a clean interface. This behavior also applies to the auto-pager option.

Styling the pager markers is entirely customizable.

#### Auto Pager Feature

The `data-auto-pager` attribute automatically generates a pager after the track element.

To customize the pager's location, include an empty `[data-pager]` container within the `snap-slider`.

```html
<snap-slider data-auto-pager>
    <div data-track>
        <!-- Slides here go here -->
    </div>
    <!-- Other HTML -->
     <div data-pager></div>
</snap-slider>
```

Reserve space for the pager by setting a `min-height` to prevent layout shifts.

Customize the pager's appearance using the default `.pager` and `.marker` classes
or by applying custom classes via `data-pager-classes` and `data-marker-classes`,
useful for integrating with CSS utility libraries.

### Example Fylgja CSS

```html
<snap-slider data-auto-pager>
    <div class="flex gap align flow-unset">
        <h2>Snap Slider Title</h2>
        <div class="flex gap">
            <button data-prev hidden aria-label="Previous Slide" class="btn --primary">←</button>
            <button data-next hidden aria-label="Next Slide" class="btn --primary">→</button>
        </div>
    </div>
    <div data-track class="snap scroll-x grid-cols grid-flow gap" style="--md_grid-cols: 2; --lg_grid-cols: 3">
        <!-- Slides here go here -->
    </div>
    <nav data-pager role="tablist" class="pager"></nav>
</snap-slider>
```

### Example Tailwind CSS

```html
<snap-slider data-auto-pager data-marker-class="size-4 border-2 rounded-full aria-current:bg-blue-700 aria-current:border-blue-700">
    <div class="flex justify-between items-center gap-4">
        <h2 class="text-xl font-bold">Snap Slider Title</h2>
        <div class="flex gap-4">
            <button data-prev hidden aria-label="Previous Slide" class="inline-flex justify-between items-center gap-2 px-2 py-1 border-2 border-blue-700 bg-blue-700 text-white hover:bg-blue-900 disabled:border-current disabled:bg-slate-500 disabled:text-slate-800 cursor-pointer">←</button>
            <button data-next hidden aria-label="Next Slide" class="inline-flex justify-between items-center gap-2 px-2 py-1 border-2 border-blue-700 bg-blue-700 text-white hover:bg-blue-900 disabled:border-current disabled:bg-slate-500 disabled:text-slate-800 cursor-pointer">→</button>
        </div>
    </div>
    <div data-track class="snap-x overflow-x overscroll-x-contain grid grid-flow-col auto-cols-fr md:auto-cols-[repeat(2,minmax(0,1fr))] lg:auto-cols-[repeat(3,minmax(0,1fr))] gap-4">
        <!-- Slides here go here -->
    </div>
    <nav data-pager role="tablist" class="flex flex-wrap justify-center items-center gap-2"></nav>
</snap-slider>
```