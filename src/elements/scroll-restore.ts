interface SavedScrollPosition {
  index: number;
  offset: number;
}

class ScrollRestoreElement extends HTMLElement {
  #connected = false;
  #position: SavedScrollPosition | undefined;
  #userMoved = false;

  connectedCallback() {
    if (this.#connected) return;
    this.#connected = true;
    history.scrollRestoration = 'manual';
    window.addEventListener('pagehide', this.#savePosition);

    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    const shouldRestore =
      !location.hash &&
      (navigation?.type === 'reload' || navigation?.type === 'back_forward');

    if (!shouldRestore) {
      if (!location.hash && navigation?.type === 'navigate') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      return;
    }

    this.#position = this.#readPosition();
    if (!this.#position) return;

    window.addEventListener('wheel', this.#markUserMoved, { passive: true });
    window.addEventListener('touchstart', this.#markUserMoved, {
      passive: true,
    });
    window.addEventListener('keydown', this.#markUserMoved);
    this.#restorePosition();

    if (document.readyState === 'complete') {
      this.#restoreAfterLoad();
    } else {
      window.addEventListener('load', this.#restoreAfterLoad, { once: true });
    }
  }

  disconnectedCallback() {
    window.removeEventListener('pagehide', this.#savePosition);
    window.removeEventListener('load', this.#restoreAfterLoad);
    this.#removeUserListeners();
    this.#connected = false;
  }

  #storageKey() {
    return `scroll-restore:${location.pathname}`;
  }

  #sections() {
    return document.querySelectorAll<HTMLElement>(
      '.case-study > .case-section',
    );
  }

  #readPosition() {
    try {
      const value = sessionStorage.getItem(this.#storageKey());
      if (!value) return undefined;
      const position = JSON.parse(value) as Partial<SavedScrollPosition>;
      if (
        !Number.isInteger(position.index) ||
        typeof position.offset !== 'number' ||
        !Number.isFinite(position.offset)
      ) {
        return undefined;
      }
      return position as SavedScrollPosition;
    } catch {
      return undefined;
    }
  }

  #savePosition = () => {
    try {
      if (window.scrollY <= 0) {
        sessionStorage.removeItem(this.#storageKey());
        return;
      }

      const sections = [...this.#sections()];
      const index = sections.findIndex((section) => {
        const box = section.getBoundingClientRect();
        return box.top <= 0 && box.bottom > 0;
      });
      if (index < 0) return;

      const offset = -sections[index]!.getBoundingClientRect().top;
      sessionStorage.setItem(
        this.#storageKey(),
        JSON.stringify({ index, offset }),
      );
    } catch {
      // Storage can be unavailable in private or restricted browsing contexts.
    }
  };

  #restorePosition = () => {
    if (!this.#position) return;
    const section = this.#sections()[this.#position.index];
    if (!section) return;
    window.scrollTo({
      top:
        section.getBoundingClientRect().top +
        window.scrollY +
        this.#position.offset,
      behavior: 'instant',
    });
  };

  #restoreAfterLoad = () => {
    if (!this.#userMoved) this.#restorePosition();
    this.#removeUserListeners();
  };

  #markUserMoved = () => {
    this.#userMoved = true;
  };

  #removeUserListeners() {
    window.removeEventListener('wheel', this.#markUserMoved);
    window.removeEventListener('touchstart', this.#markUserMoved);
    window.removeEventListener('keydown', this.#markUserMoved);
  }
}

if (!customElements.get('scroll-restore')) {
  customElements.define('scroll-restore', ScrollRestoreElement);
}
