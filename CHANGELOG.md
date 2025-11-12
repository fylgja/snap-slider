# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 2.1.0 - 2025-10-12

### Changed

- Changed the default class for the pager container from `pager` to `snap-pager`.
- Changed the default class for pager markers from `pager-item` to `snap-marker`.

### Fixed

- The slider no longer incorrectly counts `<style>` tags as slides.
- Prevented programmatic scrolling from changing focus when pager markers are off-screen.

## 2.0.0 - 2025-09-23

### Added

- Added an AlpineJS version of the Snap Slider.

### Changed

- Refactored the core logic into a reusable `SnapSlider` class.
  This class is now used by both the Custom Element and AlpineJS versions,
  and can also be used as a standalone option.

## 1.0.0 - 2025-04-08

Initial Release 🎉

[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/1.0.0...HEAD
