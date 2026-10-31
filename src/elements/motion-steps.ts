class MotionStepsElement extends HTMLElement {
  private tabs: HTMLButtonElement[] = [];
  private panels: HTMLElement[] = [];

  connectedCallback() {
    this.tabs = [...this.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    this.panels = [...this.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => this.select(index, true));
      tab.addEventListener('keydown', (event) =>
        this.handleKeydown(event, index),
      );
    });
    this.select(0, false);
  }

  private select(index: number, play: boolean) {
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
    this.select(next, true);
    this.tabs[next]?.focus();
  }
}

if (!customElements.get('motion-steps')) {
  customElements.define('motion-steps', MotionStepsElement);
}
