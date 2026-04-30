# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.2] - 2026-04-30

### Added

- Added ArrowUp and ArrowDown key support for pager navigation, consistent with ArrowLeft and ArrowRight. Arrow key events on the pager now call `preventDefault()` to prevent the page from scrolling.
- Added `inert` attribute to the pager when the slider has no overflow, ensuring hidden pager controls are fully removed from keyboard and assistive technology focus.
- Added support for dynamically showing or hiding slides via `display: none`. Hidden slides are excluded from the slide list, and the MutationObserver now watches for style attribute changes on child elements to refresh accordingly.

### Fixed

- Fixed rapid navigation triggering multiple scroll jumps by introducing a navigation lock that resets on `scrollend` (with a `scroll`-based fallback for unsupported browsers).
- Fixed `getInViewItems()` incorrectly including in-view markers from nested sliders by scoping the query to the current instance's slides only.
- Fixed the track `tabindex` being overwritten on re-init if a custom value was already set.

## [2.2.1] - 2026-04-16

### Fixed

- Fixed loop navigation getting stuck when the track contains invalid elements (such as `<template>` or `<script>` tags). Navigation now uses the filtered slides list instead of raw DOM siblings.

## [2.2.0] - 2026-04-11

### Added

- Added a `loop` option (and `data-loop` attribute). When enabled, navigation buttons never disable and the slider wraps from the last slide back to the first and vice versa. Available as a modifier in the AlpineJS integration (`x-snap-slider.loop`).

### Fixed

- Fixed an edge case where an empty slider with `group-pager` enabled would throw an error.

## [2.1.0] - 2025-10-12

### Changed

- Changed the default class for the pager container from `pager` to `snap-pager`.
- Changed the default class for pager markers from `pager-item` to `snap-marker`.

### Fixed

- The slider no longer incorrectly counts `<style>` tags as slides.
- Prevented programmatic scrolling from changing focus when pager markers are off-screen.

## [2.0.0] - 2025-09-23

### Added

- Added an AlpineJS version of the Snap Slider.

### Changed

- Refactored the core logic into a reusable `SnapSlider` class.
  This class is now used by both the Custom Element and AlpineJS versions,
  and can also be used as a standalone option.

## 1.0.0 - 2025-04-08

Initial Release 🎉

[Unreleased]: https://github.com/fylgja/snap-slider/compare/2.2.2...HEAD
[2.2.2]: https://github.com/fylgja/snap-slider/compare/2.2.1...2.2.2
[2.2.1]: https://github.com/fylgja/snap-slider/compare/2.2.0...2.2.1
[2.2.0]: https://github.com/fylgja/snap-slider/compare/2.1.0...2.2.0
[2.1.0]: https://github.com/fylgja/snap-slider/compare/2.0.0...2.1.0
[2.0.0]: https://github.com/fylgja/snap-slider/compare/1.0.0...2.0.0
