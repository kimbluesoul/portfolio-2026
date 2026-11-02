class MotionStepsElement extends HTMLElement {
  private tabs: HTMLButtonElement[] = [];
  private panels: HTMLElement[] = [];
  private observer?: IntersectionObserver;
  private events?: AbortController;
  private selectedIndex = 0;
  private autoAdvance = false;
  private hasStarted = false;

  connectedCallback() {
    this.events?.abort();
    const events = new AbortController();
    this.events = events;
    this.tabs = [...this.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    this.panels = [...this.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => this.selectByUser(index), {
        signal: events.signal,
      });
      tab.addEventListener(
        'keydown',
        (event) => this.handleKeydown(event, index),
        { signal: events.signal },
      );
    });
    this.panels.forEach((panel, index) => {
      panel.querySelectorAll('video').forEach((video) => {
        video.addEventListener('ended', () => this.handleEnded(index), {
          signal: events.signal,
        });
      });
    });
    this.select(0, false);

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry?.isIntersecting &&
          entry.intersectionRatio >= 0.5 &&
          !this.hasStarted
        ) {
          this.hasStarted = true;
          this.observer?.disconnect();
          if (!this.shouldReduceMotion()) {
            this.autoAdvance = true;
            this.select(0, true);
          }
        }
      },
      { threshold: 0.5 },
    );
    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.events?.abort();
  }

  private select(index: number, play: boolean) {
    this.selectedIndex = index;
    this.tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    this.panels.forEach((panel, panelIndex) => {
      const selected = panelIndex === index;
      panel.hidden = !selected;
      const player = panel.querySelector<HTMLElement & { play?: () => void }>(
        'loop-video',
      );
      if (selected && play) player?.play?.();
    });
  }

  private selectByUser(index: number) {
    this.hasStarted = true;
    this.observer?.disconnect();
    this.autoAdvance = false;
    this.select(index, true);
  }

  private handleEnded(index: number) {
    if (!this.autoAdvance || index !== this.selectedIndex) return;
    if (index >= this.tabs.length - 1) {
      this.autoAdvance = false;
      return;
    }
    this.select(index + 1, true);
  }

  private shouldReduceMotion() {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      connection?.saveData === true
    );
  }

  private handleKeydown(event: KeyboardEvent, index: number) {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (index + 1) % this.tabs.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = (index - 1 + this.tabs.length) % this.tabs.length;
    } else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = this.tabs.length - 1;
    else return;

    event.preventDefault();
    this.selectByUser(next);
    this.tabs[next]?.focus();
  }
}

if (!customElements.get('motion-steps')) {
  customElements.define('motion-steps', MotionStepsElement);
}
