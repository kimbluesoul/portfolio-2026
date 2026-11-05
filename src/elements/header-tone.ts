class HeaderTone extends HTMLElement {
  #header?: HTMLElement;
  #observer?: IntersectionObserver;
  #scrollObserver?: IntersectionObserver;
  #inverseTargets = new Set<Element>();

  #createObserver = () => {
    this.#observer?.disconnect();
    this.#inverseTargets.clear();

    const header = this.#header;
    const logo = header?.querySelector<SVGSVGElement>('.brand svg');
    if (!header || !logo) return;

    const logoBox = logo.getBoundingClientRect();
    const lineY = Math.round(logoBox.top + logoBox.height / 2);
    const bottomMargin = Math.max(0, window.innerHeight - lineY - 1);

    this.#observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.#inverseTargets.add(entry.target);
          else this.#inverseTargets.delete(entry.target);
        }
        if (this.#inverseTargets.size > 0) {
          header.dataset.tone = 'inverse';
        } else {
          delete header.dataset.tone;
        }
      },
      {
        rootMargin: `-${lineY}px 0px -${bottomMargin}px 0px`,
        threshold: 0,
      },
    );

    for (const target of document.querySelectorAll(
      '.case-section.tone-inverse, .site-footer',
    )) {
      this.#observer.observe(target);
    }
  };

  #createScrollObserver = () => {
    this.#scrollObserver?.disconnect();

    const header = this.#header;
    const sentinel = document.querySelector('.header-scroll-sentinel');
    if (!header || !sentinel) return;

    this.#scrollObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) delete header.dataset.scrolled;
      else header.dataset.scrolled = '';
    });
    this.#scrollObserver.observe(sentinel);
  };

  connectedCallback() {
    const header = this.previousElementSibling;
    if (!(header instanceof HTMLElement) || !header.matches('.site-header'))
      return;

    this.#header = header;
    this.#createObserver();
    this.#createScrollObserver();
    window.addEventListener('resize', this.#createObserver, { passive: true });
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#scrollObserver?.disconnect();
    window.removeEventListener('resize', this.#createObserver);
    this.#header?.removeAttribute('data-tone');
    this.#header?.removeAttribute('data-scrolled');
  }
}

if (!customElements.get('header-tone')) {
  customElements.define('header-tone', HeaderTone);
}
