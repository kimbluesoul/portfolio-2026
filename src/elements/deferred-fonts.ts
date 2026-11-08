interface DeferredFontFace {
  src: string;
  weight: number;
  unicodeRange: string;
}

class DeferredFontsElement extends HTMLElement {
  #loaded = false;

  connectedCallback() {
    if (document.readyState === 'complete') {
      this.#register();
    } else {
      window.addEventListener('load', this.#register, { once: true });
    }
  }

  disconnectedCallback() {
    window.removeEventListener('load', this.#register);
  }

  #register = () => {
    if (this.#loaded || !this.isConnected) return;
    this.#loaded = true;

    let faces: DeferredFontFace[];
    try {
      faces = JSON.parse(this.dataset.faces ?? '[]') as DeferredFontFace[];
    } catch {
      return;
    }

    for (const { src, weight, unicodeRange } of faces) {
      const face = new FontFace(
        'Noto Sans TC',
        `url('${src}') format('woff2')`,
        {
          style: 'normal',
          weight: String(weight),
          display: 'swap',
          unicodeRange,
        },
      );
      document.fonts.add(face);
      void face.load();
    }
  };
}

if (!customElements.get('deferred-fonts')) {
  customElements.define('deferred-fonts', DeferredFontsElement);
}
