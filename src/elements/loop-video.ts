class LoopVideoElement extends HTMLElement {
  private video: HTMLVideoElement | null = null;
  private observer: IntersectionObserver | null = null;
  private hoverCapable = false;

  connectedCallback() {
    this.video = this.querySelector('video');
    if (!this.video || this.dataset.state === 'pending') return;

    this.hoverCapable = matchMedia(
      '(hover: hover) and (pointer: fine)',
    ).matches;
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.pause);
    this.addEventListener('focusin', this.handleEnter);
    this.addEventListener('focusout', this.pause);
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeydown);
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) this.pause();
      },
      { threshold: 0.15 },
    );
    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.removeEventListener('pointerenter', this.handlePointerEnter);
    this.removeEventListener('pointerleave', this.pause);
    this.removeEventListener('focusin', this.handleEnter);
    this.removeEventListener('focusout', this.pause);
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeydown);
    this.observer?.disconnect();
  }

  play = async () => {
    if (!this.video) return;
    try {
      await this.video.play();
      this.dataset.state = 'playing';
    } catch {
      this.dataset.state = 'paused';
    }
  };

  pause = () => {
    this.video?.pause();
    if (this.dataset.state !== 'pending') this.dataset.state = 'paused';
  };

  private handlePointerEnter = () => {
    if (
      this.hoverCapable &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      void this.play();
    }
  };

  private handleEnter = () => void this.play();

  private handleClick = () => {
    if (!this.video) return;
    if (this.video.paused) void this.play();
    else this.pause();
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.handleClick();
  };
}

if (!customElements.get('loop-video')) {
  customElements.define('loop-video', LoopVideoElement);
}
