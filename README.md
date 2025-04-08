# Fylgja - Snap Slider

[![NPM version](https://img.shields.io/npm/v/@fylgja/snap-slider?logo=npm)](https://www.npmjs.com/package/@fylgja/snap-slider)
[![License](https://img.shields.io/github/license/@fylgja/snap-slider?color=%23234)](/LICENSE)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1a127f61-d12b-46cf-858f-65a1350323e7/deploy-status)](https://app.netlify.com/sites/fylgja-snap-slider/deploys)

A CSS-powered slider/carousel, enhanced with JavaScript for improved functionality and accessibility.

**Live Demo:** [https://fylgja-snap-slider.netlify.app/](https://fylgja-snap-slider.netlify.app/)

## Installation

Integrate the Snap Slider into your project via NPM or CDN.

### NPM Installation

Install the package and import it into your JavaScript bundle:

```sh
npm install @fylgja/snap-slider
```

```js
import '@fylgja/snap-slider';
```

### CDN Integration

Include the script directly in your HTML using a `<script>` tag:

```html
<script defer src="https://unpkg.com/@fylgja/snap-slider/dist/index.min.js"></script>
```

## Usage

Utilize the `snap-slider` custom element as you would any standard HTML tag.

A `[data-track]` child element is mandatory for slide containment.

```html
<snap-slider>
    <div data-track>
        <!-- Slides here go here -->
    </div>
</snap-slider>
```

While functional, the slider requires CSS styling for visual presentation.

The component enhances accessibility by managing `inert` attributes for off-screen slides and adding ARIA labels.

Enhance the slider with navigation buttons and pagination markers using specific data attributes.

**Key Principle:** The slider leverages CSS for styling,
with JavaScript providing progressive enhancement for functionality and accessibility.

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

To create a custom pager, each slide must have a unique identifier (ID). These IDs are then linked to pager markers using either anchor links (`href` with a hash) or buttons with the `[data-target-id]` attribute.

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
