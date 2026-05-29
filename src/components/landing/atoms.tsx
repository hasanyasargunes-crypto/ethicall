"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export function useReveal() {
  useEffect(() => {
    const forceShow = (e: Element) => e.classList.add("reveal-shown");

    const reveal = (e: Element) => {
      if (e.classList.contains("is-visible")) return;
      e.classList.add("is-visible");
      setTimeout(() => forceShow(e), 1000);
    };

    const showIfInView = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll(".lp-reveal:not(.is-visible)").forEach((e) => {
        const rect = e.getBoundingClientRect();
        if (rect.top < vh * 0.94 && rect.bottom > -40) reveal(e);
      });
    };

    showIfInView();
    const timers = [0, 60, 160, 320, 600, 1000].map((ms) =>
      setTimeout(showIfInView, ms)
    );

    const forceAll = setTimeout(() => {
      document.querySelectorAll(".lp-reveal").forEach((e) => {
        e.classList.add("is-visible");
        forceShow(e);
      });
    }, 2600);

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              reveal(en.target);
              io!.unobserve(en.target);
            }
          });
        },
        { threshold: 0.06, rootMargin: "0px 0px -5% 0px" }
      );
      document.querySelectorAll(".lp-reveal").forEach((e) => io!.observe(e));
    }

    window.addEventListener("scroll", showIfInView, { passive: true });
    window.addEventListener("resize", showIfInView, { passive: true });
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(forceAll);
      if (io) io.disconnect();
      window.removeEventListener("scroll", showIfInView);
      window.removeEventListener("resize", showIfInView);
    };
  }, []);
}

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  style = {},
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}) {
  const Component = Tag as any;
  return (
    <Component
      className={`lp-reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 9,
        background: "var(--lp-green-700)",
        display: "grid",
        placeItems: "center",
        boxShadow: "var(--lp-shadow-sm)",
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--lp-bg-paper)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l7 3v5c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V6l7-3z" />
        <path d="M9.2 12l2 2 3.6-3.8" />
      </svg>
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lede,
  align = "left",
  maxw = 640,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  maxw?: number;
}) {
  return (
    <div
      style={{
        textAlign: align,
        maxWidth: align === "center" ? maxw : "none",
        margin: align === "center" ? "0 auto" : 0,
      }}
    >
      {eyebrow && (
        <Reveal as="span" className="lp-eyebrow">
          <span className="lp-eyebrow-dot" />
          {eyebrow}
        </Reveal>
      )}
      <Reveal
        as="h2"
        delay={60}
        className="lp-display"
        style={{
          fontSize: "clamp(30px, 3.6vw, 50px)",
          margin: "20px 0 0",
          maxWidth: maxw,
          marginLeft: align === "center" ? "auto" : 0,
          marginRight: align === "center" ? "auto" : 0,
          textWrap: "balance" as any,
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: title }} />
      </Reveal>
      {lede && (
        <Reveal
          as="p"
          delay={120}
          style={{
            fontSize: 18.5,
            lineHeight: 1.55,
            color: "var(--lp-ink-muted)",
            margin: "18px 0 0",
            maxWidth: 560,
            marginLeft: align === "center" ? "auto" : 0,
            marginRight: align === "center" ? "auto" : 0,
            textWrap: "pretty" as any,
          }}
        >
          {lede}
        </Reveal>
      )}
    </div>
  );
}
