"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type MediaWidgetProps = {
  style?: CSSProperties;
  text?: string;
};

function splitContent(value: string | undefined, fallback: string[]) {
  const parts = String(value || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : fallback;
}

export function MediaSliderWidget({ style, text }: MediaWidgetProps) {
  const slides = useMemo(() => {
    const parts = splitContent(text, ["Featured collection", "New arrivals", "Editor's pick"]);

    if (parts.length >= 3) {
      return parts.slice(0, 6);
    }

    return [parts[0] || "Featured collection", "New arrivals", "Editor's pick"];
  }, [text]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  function goTo(nextIndex: number) {
    setIndex((nextIndex + slides.length) % slides.length);
  }

  return (
    <div className="ffSliderWidget wpSlider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={style}>
      <div className="wpSlideText" key={index}>
        <strong>{slides[index]}</strong>
        <span>
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>
      <section>
        <button aria-label="Previous slide" onClick={() => goTo(index - 1)} type="button">
          ‹
        </button>
        <button aria-label="Next slide" onClick={() => goTo(index + 1)} type="button">
          ›
        </button>
      </section>
      <footer>
        {slides.map((slide, dotIndex) => (
          <i className={dotIndex === index ? "active" : ""} key={`${slide}-${dotIndex}`} onClick={() => goTo(dotIndex)} />
        ))}
      </footer>
    </div>
  );
}

export function MediaGalleryWidget({ style }: MediaWidgetProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const items = useMemo(() => Array.from({ length: 6 }, (_, index) => index), []);

  useEffect(() => {
    if (lightbox === null) {
      return;
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightbox(null);
      }

      if (event.key === "ArrowLeft") {
        setLightbox((current) => (current === null ? current : (current - 1 + items.length) % items.length));
      }

      if (event.key === "ArrowRight") {
        setLightbox((current) => (current === null ? current : (current + 1) % items.length));
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [items.length, lightbox]);

  function moveLightbox(delta: number) {
    setLightbox((current) => (current === null ? current : (current + delta + items.length) % items.length));
  }

  return (
    <>
      <div className="ffGalleryWidget wpGallery" style={style}>
        {items.map((item) => (
          <button aria-label={`Open gallery item ${item + 1}`} key={item} onClick={() => setLightbox(item)} type="button">
            <em />
          </button>
        ))}
      </div>
      {lightbox !== null ? (
        <div className="wpLightbox" onClick={() => setLightbox(null)}>
          <figure onClick={(event) => event.stopPropagation()}>
            <button aria-label="Previous gallery item" className="wpLightboxNav prev" onClick={() => moveLightbox(-1)} type="button">
              ‹
            </button>
            <figcaption>
              Gallery item {lightbox + 1} / {items.length}
            </figcaption>
            <button aria-label="Next gallery item" className="wpLightboxNav next" onClick={() => moveLightbox(1)} type="button">
              ›
            </button>
            <button aria-label="Close gallery" className="wpLightboxClose" onClick={() => setLightbox(null)} type="button">
              ×
            </button>
          </figure>
        </div>
      ) : null}
    </>
  );
}
