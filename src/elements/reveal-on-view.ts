class RevealOnView extends HTMLElement {
  connectedCallback() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.dataset.inview = '';
      return;
    }

    this.dataset.revealReady = '';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        this.dataset.inview = '';
        observer.disconnect();
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    observer.observe(this);
  }
}

if (!customElements.get('reveal-on-view')) {
  customElements.define('reveal-on-view', RevealOnView);
}
