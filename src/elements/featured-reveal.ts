const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const HOLD_SHARE = 0.05;
const STAGE_OVERSHOOT = 1.2;
const WINDOW_HEIGHT_FACTOR = 1.45;

const smootherstep = (value: number) =>
  value * value * value * (value * (value * 6 - 15) + 10);

class FeaturedReveal extends HTMLElement {
  private frame: HTMLElement | null = null;
  private sticky: HTMLElement | null = null;
  private windowElement: HTMLElement | null = null;
  private stage: HTMLElement | null = null;
  private hero: HTMLElement | null = null;
  private headlineObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private frameRequest = 0;
  private enabled = false;
  private measurements = {
    cardWidth: 0,
    cardHeight: 0,
    peakWidth: 0,
    peakHeight: 0,
    peakScale: 1,
    radius: 0,
    runway: 0,
    stickyTop: 0,
    growDistance: 1,
  };

  connectedCallback() {
    this.frame = this.querySelector<HTMLElement>('[data-featured-frame]');
    this.sticky = this.querySelector<HTMLElement>('[data-featured-sticky]');
    this.windowElement = this.querySelector<HTMLElement>(
      '[data-featured-window]',
    );
    this.stage = this.querySelector<HTMLElement>('[data-featured-stage]');
    this.hero = document.querySelector<HTMLElement>('.hero');
    this.dataset.progress = '0.000';

    const headline = this.hero?.querySelector('h1');
    const moment = this.hero?.querySelector<HTMLElement>('.accent-moment');
    if (headline && !matchMedia(REDUCED_MOTION_QUERY).matches) {
      this.headlineObserver = new IntersectionObserver(([entry]) => {
        moment?.toggleAttribute(
          'data-headline-offscreen',
          entry?.isIntersecting === false,
        );
      });
      this.headlineObserver.observe(headline);
    }

    if (
      !this.frame ||
      !this.sticky ||
      !this.windowElement ||
      !this.stage ||
      matchMedia(REDUCED_MOTION_QUERY).matches
    ) {
      return;
    }

    this.enabled = true;
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.frame);
    window.addEventListener('scroll', this.queueRender, { passive: true });
    window.addEventListener('resize', this.handleResize);

    requestAnimationFrame(() => this.measure());
  }

  disconnectedCallback() {
    this.enabled = false;
    cancelAnimationFrame(this.frameRequest);
    this.resizeObserver?.disconnect();
    this.headlineObserver?.disconnect();
    window.removeEventListener('scroll', this.queueRender);
    window.removeEventListener('resize', this.handleResize);
    this.hero?.style.removeProperty('opacity');
    this.hero?.style.removeProperty('transform');
    this.windowElement?.style.removeProperty('border-radius');
  }

  private handleResize = () => {
    this.measure();
  };

  private measure() {
    if (
      !this.enabled ||
      !this.frame ||
      !this.sticky ||
      !this.windowElement ||
      !this.stage
    ) {
      return;
    }

    const cardWidth = this.frame.clientWidth;
    const cardHeight = this.frame.clientHeight;
    const peakWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const runway = this.clientHeight - cardHeight;

    // The CSS-only runway is the enhancement gate. If it is absent, the
    // element must behave exactly like the unenhanced card.
    if (runway <= 1) {
      this.enabled = false;
      return;
    }

    const peakScale = (peakWidth / cardWidth) * STAGE_OVERSHOOT;
    const peakHeight = Math.max(
      cardHeight,
      Math.min(
        cardHeight * peakScale * WINDOW_HEIGHT_FACTOR,
        viewportHeight * 0.9,
      ),
    );
    const headerOffset = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--header-height',
      ),
    );
    const stickyTop = Math.max(
      headerOffset + 24,
      (viewportHeight - cardHeight) / 2,
    );
    const documentTop = this.getBoundingClientRect().top + window.scrollY;
    const growDistance = Math.max(
      1,
      Math.min(documentTop, viewportHeight * 0.9) - stickyTop,
    );
    const radius =
      this.measurements.radius ||
      Number.parseFloat(
        getComputedStyle(this.windowElement).borderTopLeftRadius,
      );

    this.measurements = {
      cardWidth,
      cardHeight,
      peakWidth,
      peakHeight,
      peakScale,
      radius,
      runway,
      stickyTop,
      growDistance,
    };

    this.sticky.style.setProperty('--featured-sticky-top', `${stickyTop}px`);
    this.windowElement.style.width = `${peakWidth}px`;
    this.windowElement.style.height = `${peakHeight}px`;
    this.windowElement.style.borderRadius = '0';
    this.stage.style.width = `${cardWidth}px`;
    this.stage.style.height = `${cardHeight}px`;
    this.render();
  }

  private queueRender = () => {
    if (this.frameRequest) return;
    this.frameRequest = requestAnimationFrame(() => {
      this.frameRequest = 0;
      this.render();
    });
  };

  private getProgress(offset: number) {
    const { growDistance, runway } = this.measurements;
    if (offset <= -growDistance) return 0;
    if (offset < 0) return smootherstep((offset + growDistance) / growDistance);
    if (offset <= HOLD_SHARE * runway) return 1;
    if (offset <= runway) {
      return (
        1 -
        smootherstep(
          (offset - HOLD_SHARE * runway) / ((1 - HOLD_SHARE) * runway),
        )
      );
    }
    return 0;
  }

  private render() {
    if (!this.enabled || !this.windowElement || !this.stage || !this.hero) {
      return;
    }

    const {
      cardWidth,
      cardHeight,
      peakWidth,
      peakHeight,
      peakScale,
      radius,
      runway,
      stickyTop,
    } = this.measurements;
    const offset = stickyTop - this.getBoundingClientRect().top;
    const progress = this.getProgress(offset);
    const width = cardWidth + (peakWidth - cardWidth) * progress;
    const height = cardHeight + (peakHeight - cardHeight) * progress;
    const horizontalInset = (peakWidth - width) / 2;
    const verticalInset = (peakHeight - height) / 2;
    const currentRadius = radius * (1 - progress);
    const scale = 1 + (peakScale - 1) * progress;

    this.dataset.progress = progress.toFixed(3);
    this.windowElement.style.clipPath = `inset(${verticalInset}px ${horizontalInset}px round ${currentRadius}px)`;
    this.stage.style.transform = `translate(-50%, -50%) scale(${scale})`;

    const heroProgress = offset < 0 ? progress : 1;
    this.hero.style.opacity = String(1 - 0.55 * heroProgress);
    this.hero.style.transform = `translateY(${-28 * heroProgress}px)`;

    if (offset > runway) this.dataset.progress = '0.000';
  }
}

if (!customElements.get('featured-reveal')) {
  customElements.define('featured-reveal', FeaturedReveal);
}
