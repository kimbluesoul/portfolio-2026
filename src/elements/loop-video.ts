class LoopVideoElement extends HTMLElement {
  private videos: HTMLVideoElement[] = [];
  private lazyObserver: IntersectionObserver | null = null;
  private viewObserver: IntersectionObserver | null = null;
  private hoverCapable = false;
  private inView = false;
  private playGeneration = 0;
  private endedVideos = new Set<HTMLVideoElement>();

  connectedCallback() {
    this.videos = [...this.querySelectorAll('video')];
    if (this.videos.length === 0 || this.dataset.state === 'pending') return;

    this.dataset.state = 'idle';
    this.hoverCapable = matchMedia(
      '(hover: hover) and (pointer: fine)',
    ).matches;

    for (const video of this.videos) {
      // Native controls are the no-JavaScript fallback. Once enhanced, the
      // whole group follows the shared playback rules instead.
      video.controls = false;
      video.addEventListener('ended', this.handleEnded);
    }

    const interactionTarget = this.closest('a') ?? this;
    interactionTarget.addEventListener('pointerenter', this.handlePointerEnter);
    interactionTarget.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('click', this.handleClick);

    this.lazyObserver = new IntersectionObserver(this.handleNearView, {
      rootMargin: '100% 0px',
    });
    this.lazyObserver.observe(this);

    this.viewObserver = new IntersectionObserver(this.handleViewChange, {
      threshold: [0, 0.5],
    });
    this.viewObserver.observe(this);
  }

  disconnectedCallback() {
    const interactionTarget = this.closest('a') ?? this;
    interactionTarget.removeEventListener(
      'pointerenter',
      this.handlePointerEnter,
    );
    interactionTarget.removeEventListener('focusin', this.handleFocusIn);
    this.removeEventListener('click', this.handleClick);
    for (const video of this.videos) {
      video.removeEventListener('ended', this.handleEnded);
    }
    this.lazyObserver?.disconnect();
    this.viewObserver?.disconnect();
  }

  play = async () => {
    this.attachSources();
    const generation = ++this.playGeneration;
    this.endedVideos.clear();

    try {
      await Promise.all(this.videos.map((video) => this.whenPlayable(video)));
      if (generation !== this.playGeneration) return;

      for (const video of this.videos) video.currentTime = 0;
      const results = await Promise.allSettled(
        this.videos.map((video) => video.play()),
      );
      if (generation !== this.playGeneration) return;
      this.dataset.state = results.some(({ status }) => status === 'fulfilled')
        ? 'playing'
        : 'paused';
    } catch {
      if (generation === this.playGeneration) this.dataset.state = 'paused';
    }
  };

  pause = () => {
    this.playGeneration += 1;
    for (const video of this.videos) video.pause();
    if (this.dataset.state !== 'pending') this.dataset.state = 'paused';
  };

  private attachSources() {
    for (const video of this.videos) {
      let attached = false;
      const poster = video.dataset.poster;
      if (poster) {
        video.poster = poster;
        video.removeAttribute('data-poster');
      }
      for (const source of video.querySelectorAll<HTMLSourceElement>(
        'source[data-src]',
      )) {
        const src = source.dataset.src;
        if (!src) continue;
        source.src = src;
        source.removeAttribute('data-src');
        attached = true;
      }
      const src = video.dataset.src;
      if (src) {
        video.src = src;
        video.removeAttribute('data-src');
        attached = true;
      }
      if (attached) video.load();
    }
  }

  private whenPlayable(video: HTMLVideoElement) {
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      video.addEventListener('canplay', () => resolve(), { once: true });
      video.addEventListener('error', () => reject(video.error), {
        once: true,
      });
    });
  }

  private handleNearView = ([entry]: IntersectionObserverEntry[]) => {
    if (!entry?.isIntersecting) return;
    this.attachSources();
    this.lazyObserver?.disconnect();
  };

  private handleViewChange = ([entry]: IntersectionObserverEntry[]) => {
    if (!entry) return;
    const isInView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    if (isInView === this.inView) return;
    this.inView = isInView;
    if (isInView) {
      if (this.canPlayOnView()) void this.play();
    } else {
      this.pause();
    }
  };

  private handleEnded = (event: Event) => {
    this.endedVideos.add(event.currentTarget as HTMLVideoElement);
    if (this.endedVideos.size === this.videos.length) {
      this.dataset.state = 'ended';
    }
  };

  private handlePointerEnter = () => {
    if (this.hoverCapable) void this.play();
  };

  private handleFocusIn = () => {
    if (this.hoverCapable) void this.play();
  };

  private handleClick = (event: MouseEvent) => {
    if (this.closest('a') || this.hoverCapable || event.detail === 0) return;
    void this.play();
  };

  private canPlayOnView() {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    return (
      !matchMedia('(prefers-reduced-motion: reduce)').matches &&
      connection?.saveData !== true
    );
  }
}

if (!customElements.get('loop-video')) {
  customElements.define('loop-video', LoopVideoElement);
}

const mountDeferredLoopVideos = () => {
  for (const template of document.querySelectorAll<HTMLTemplateElement>(
    'template[data-deferred-loop-video]',
  )) {
    template.replaceWith(template.content.cloneNode(true));
  }
};

if (document.readyState === 'complete') {
  requestAnimationFrame(mountDeferredLoopVideos);
} else {
  window.addEventListener(
    'load',
    () => requestAnimationFrame(mountDeferredLoopVideos),
    { once: true },
  );
}
