// jsdom ships neither IntersectionObserver nor ResizeObserver, so the slider
// cannot construct without these. Inert on purpose, in-view state is driven
// explicitly by the tests that need it.
class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
}

globalThis.IntersectionObserver = NoopObserver;
globalThis.ResizeObserver = NoopObserver;
