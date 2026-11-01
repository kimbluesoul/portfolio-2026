// Mobile Safari fills the overscroll strip (and the area behind its bottom
// toolbar) with the root background. Every page ends in the dark footer, so
// the root turns dark while the footer is on screen and the page has been
// scrolled, and stays white otherwise: pulling down at the top shows white.
// Only an off-page color changes, so there is no motion and no layout shift.
// The element itself is a thin fixed bar in the footer color (iOS 26 Safari
// tints its toolbar from fixed elements at the viewport edge); it shows only
// once the footer covers the bottom edge by the bar height (--space-2, 8 px).
class FooterTint extends HTMLElement {
  #observer?: IntersectionObserver;

  #update = () => {
    document.documentElement.toggleAttribute(
      'data-footer-tint',
      window.scrollY > 0,
    );
  };

  connectedCallback() {
    const footer = this.previousElementSibling;
    if (footer?.tagName !== 'FOOTER') return;

    this.#observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          this.#update();
          window.addEventListener('scroll', this.#update, { passive: true });
        } else {
          window.removeEventListener('scroll', this.#update);
          document.documentElement.removeAttribute('data-footer-tint');
        }
      },
      { rootMargin: '0px 0px -8px 0px' },
    );
    this.#observer.observe(footer);
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    window.removeEventListener('scroll', this.#update);
    document.documentElement.removeAttribute('data-footer-tint');
  }
}

if (!customElements.get('footer-tint')) {
  customElements.define('footer-tint', FooterTint);
}
