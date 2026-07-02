"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type MediaWidgetProps = {
  autoplay?: boolean;
  galleryMode?: "carousel" | "grid" | "masonry";
  interval?: number;
  showControls?: boolean;
  showDots?: boolean;
  style?: CSSProperties;
  text?: string;
  transition?: "fade" | "slide";
};

function splitContent(value: string | undefined, fallback: string[]) {
  const parts = String(value || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : fallback;
}

export function MediaSliderWidget({
  autoplay = true,
  interval = 3200,
  showControls = true,
  showDots = true,
  style,
  text,
  transition = "slide"
}: MediaWidgetProps) {
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
    if (!autoplay || paused || slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, Math.max(900, interval));

    return () => window.clearInterval(timer);
  }, [autoplay, interval, paused, slides.length]);

  function goTo(nextIndex: number) {
    setIndex((nextIndex + slides.length) % slides.length);
  }

  return (
    <div className={`ffSliderWidget wpSlider ${transition === "fade" ? "fade" : "slide"}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={style}>
      <div className="wpSlideText" key={index}>
        <strong>{slides[index]}</strong>
        <span>
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>
      {showControls ? (
        <section>
          <button aria-label="Previous slide" onClick={() => goTo(index - 1)} type="button">
            ‹
          </button>
          <button aria-label="Next slide" onClick={() => goTo(index + 1)} type="button">
            ›
          </button>
        </section>
      ) : null}
      {showDots ? (
        <footer>
          {slides.map((slide, dotIndex) => (
            <i className={dotIndex === index ? "active" : ""} key={`${slide}-${dotIndex}`} onClick={() => goTo(dotIndex)} />
          ))}
        </footer>
      ) : null}
    </div>
  );
}

export function MediaGalleryWidget({ galleryMode = "grid", showControls = true, showDots = true, style }: MediaWidgetProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
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

  function moveGallery(delta: number) {
    setActiveIndex((current) => (current + delta + items.length) % items.length);
  }

  const visibleItems = galleryMode === "carousel" ? [activeIndex] : items;

  return (
    <>
      <div className={`ffGalleryWidget wpGallery ${galleryMode}`} style={style}>
        {visibleItems.map((item) => (
          <button aria-label={`Open gallery item ${item + 1}`} key={item} onClick={() => setLightbox(item)} type="button">
            <em />
          </button>
        ))}
        {galleryMode === "carousel" && showControls ? (
          <section className="wpGalleryControls">
            <button aria-label="Previous gallery item" onClick={() => moveGallery(-1)} type="button">
              ‹
            </button>
            <button aria-label="Next gallery item" onClick={() => moveGallery(1)} type="button">
              ›
            </button>
          </section>
        ) : null}
        {galleryMode === "carousel" && showDots ? (
          <footer>
            {items.map((item) => (
              <i className={item === activeIndex ? "active" : ""} key={item} onClick={() => setActiveIndex(item)} />
            ))}
          </footer>
        ) : null}
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
