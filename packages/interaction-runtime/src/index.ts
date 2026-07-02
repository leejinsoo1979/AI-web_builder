/**
 * WEBABLE interaction runtime — the shared contract and engine for node interactions.
 *
 * The data model is deliberately more general than what the editor UI exposes today:
 * triggers and action lists cover the full range of web interactions (click, hover,
 * scroll, load, state, timelines), while the editor grows into it phase by phase.
 * Both the editor preview and the published renderer must run THIS engine so that
 * "what you preview is what you publish" holds structurally.
 */

export type InteractionTrigger =
  | { type: "click" }
  | { type: "doubleClick" }
  | { type: "focusWithin" }
  | { type: "formSubmit" }
  | { type: "hover" }
  | { type: "inputChange" }
  | { type: "mouseDown" }
  | { type: "mouseUp" }
  | { type: "pageLoad"; delay?: number }
  | { type: "viewEnter"; threshold?: number };

export type AppearEffect = "fadeIn" | "fadeUp" | "none" | "slideLeft" | "slideRight" | "zoomIn";
export type HoverPreset = "glow" | "lift" | "none" | "scale";
export type InteractionEasing = "ease" | "linear" | "spring";

export type AnimationSpec = {
  delay: number;
  duration: number;
  easing: InteractionEasing;
  effect: AppearEffect;
  fill?: FillMode;
  iterations?: number;
};

export type InteractionAction =
  | { duration?: number; type: "delay" }
  | { kind: "anchor" | "email" | "page" | "url"; newTab?: boolean; target: string; type: "navigate" }
  | { spec: AnimationSpec; target?: string; type: "animate" }
  | { preset: HoverPreset; type: "hoverStyle" }
  | { behavior?: ScrollBehavior; block?: ScrollLogicalPosition; target: string; type: "scrollTo" }
  | { className: string; mode?: "add" | "remove" | "toggle"; target?: string; type: "setClass" }
  | { easing?: InteractionEasing; duration?: number; style: Partial<CSSStyleDeclaration>; target?: string; type: "setStyle" }
  | { mode?: "clear" | "set" | "toggle"; state: string; target?: string; type: "setState" }
  | { mode?: "hide" | "show" | "toggle"; target: string; type: "toggleVisibility" };

export type InteractionCondition =
  | { type: "always" }
  | { target?: string; type: "hidden" | "visible" }
  | { className: string; target?: string; type: "classPresent" }
  | { state: string; target?: string; type: "stateEquals" };

export type Interaction = {
  actions: InteractionAction[];
  condition?: InteractionCondition;
  id: string;
  trigger: InteractionTrigger;
};

export type InteractionContext = {
  navigate: (kind: "anchor" | "email" | "page" | "url", target: string, newTab?: boolean) => void;
  resolveNode: (nodeId: string) => HTMLElement | null;
};

const EASINGS: Record<InteractionEasing, string> = {
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  linear: "linear",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
};

const APPEAR_KEYFRAMES: Record<Exclude<AppearEffect, "none">, Keyframe[]> = {
  fadeIn: [{ opacity: 0 }, { opacity: 1 }],
  fadeUp: [
    { opacity: 0, transform: "translateY(32px)" },
    { opacity: 1, transform: "translateY(0)" }
  ],
  slideLeft: [
    { opacity: 0, transform: "translateX(48px)" },
    { opacity: 1, transform: "translateX(0)" }
  ],
  slideRight: [
    { opacity: 0, transform: "translateX(-48px)" },
    { opacity: 1, transform: "translateX(0)" }
  ],
  zoomIn: [
    { opacity: 0, transform: "scale(0.86)" },
    { opacity: 1, transform: "scale(1)" }
  ]
};

const HOVER_KEYFRAMES: Record<Exclude<HoverPreset, "none">, Keyframe> = {
  glow: { boxShadow: "0 14px 34px rgba(37, 99, 235, 0.35)", transform: "translateY(-2px)" },
  lift: { boxShadow: "0 16px 30px rgba(15, 23, 42, 0.2)", transform: "translateY(-4px)" },
  scale: { transform: "scale(1.045)" }
};

export function runAppearAnimation(element: HTMLElement, spec: AnimationSpec): Animation | null {
  if (spec.effect === "none" || typeof element.animate !== "function") {
    return null;
  }

  return element.animate(APPEAR_KEYFRAMES[spec.effect], {
    delay: spec.delay,
    duration: Math.max(80, spec.duration),
    easing: EASINGS[spec.easing],
    fill: spec.fill ?? "both",
    iterations: spec.iterations ?? 1
  });
}

function bindHoverPreset(element: HTMLElement, preset: HoverPreset): () => void {
  if (preset === "none" || typeof element.animate !== "function") {
    return () => undefined;
  }

  const frame = HOVER_KEYFRAMES[preset];
  let animation: Animation | null = null;

  function handleEnter() {
    animation?.cancel();
    animation = element.animate([{}, frame], { duration: 200, easing: EASINGS.ease, fill: "forwards" });
  }

  function handleLeave() {
    animation?.cancel();
    animation = element.animate([frame, {}], { duration: 220, easing: EASINGS.ease, fill: "forwards" });
  }

  element.addEventListener("mouseenter", handleEnter);
  element.addEventListener("mouseleave", handleLeave);
  return () => {
    animation?.cancel();
    element.removeEventListener("mouseenter", handleEnter);
    element.removeEventListener("mouseleave", handleLeave);
  };
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, ms)));
}

async function waitForAnimation(animation: Animation | null) {
  if (!animation) {
    return;
  }

  try {
    await animation.finished;
  } catch {
    // Cancelled animations are expected when users quickly re-trigger interactions.
  }
}

function getActionTarget(element: HTMLElement, target: string | undefined, context: InteractionContext) {
  return target ? context.resolveNode(target) : element;
}

function setElementVisibility(element: HTMLElement, mode: "hide" | "show" | "toggle" = "toggle") {
  if (mode === "show") {
    element.style.visibility = "visible";
    element.style.pointerEvents = "";
    element.dataset.webableHidden = "false";
    return;
  }

  if (mode === "hide") {
    element.style.visibility = "hidden";
    element.style.pointerEvents = "none";
    element.dataset.webableHidden = "true";
    return;
  }

  const hidden = element.dataset.webableHidden === "true" || element.style.visibility === "hidden";
  setElementVisibility(element, hidden ? "show" : "hide");
}

function setElementState(element: HTMLElement, state: string, mode: "clear" | "set" | "toggle" = "set") {
  const normalized = state.trim().replace(/[^a-zA-Z0-9_-]/g, "-");

  if (!normalized) {
    return;
  }

  const className = `is-state-${normalized}`;
  const active = element.dataset.webableState === normalized;

  if (mode === "clear" || (mode === "toggle" && active)) {
    element.classList.remove(className);
    delete element.dataset.webableState;
    return;
  }

  const previous = element.dataset.webableState;
  if (previous) {
    element.classList.remove(`is-state-${previous}`);
  }

  element.dataset.webableState = normalized;
  element.classList.add(className);
}

function getStyleFrame(style: Partial<CSSStyleDeclaration>) {
  return Object.entries(style).reduce<Keyframe>((frame, [key, value]) => {
    if (typeof value === "string" && value.trim()) {
      frame[key as keyof Keyframe] = value as never;
    }

    return frame;
  }, {});
}

async function applyStyle(element: HTMLElement, action: Extract<InteractionAction, { type: "setStyle" }>) {
  if (action.duration && action.duration > 0 && typeof element.animate === "function") {
    const targetFrame = getStyleFrame(action.style);
    const currentStyle = window.getComputedStyle(element);
    const startFrame = Object.keys(targetFrame).reduce<Keyframe>((frame, key) => {
      frame[key as keyof Keyframe] = currentStyle.getPropertyValue(key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)) as never;
      return frame;
    }, {});

    await waitForAnimation(
      element.animate([startFrame, targetFrame], {
        duration: action.duration,
        easing: EASINGS[action.easing ?? "ease"],
        fill: "forwards"
      })
    );
  }

  Object.assign(element.style, action.style);
}

function passesCondition(element: HTMLElement, condition: InteractionCondition | undefined, context: InteractionContext) {
  if (!condition || condition.type === "always") {
    return true;
  }

  const target = getActionTarget(element, condition.target, context);

  if (!target) {
    return false;
  }

  if (condition.type === "visible") {
    return target.dataset.webableHidden !== "true" && target.style.visibility !== "hidden";
  }

  if (condition.type === "hidden") {
    return target.dataset.webableHidden === "true" || target.style.visibility === "hidden";
  }

  if (condition.type === "classPresent") {
    return Boolean(condition.className.trim()) && target.classList.contains(condition.className.trim());
  }

  if (condition.type === "stateEquals") {
    return target.dataset.webableState === condition.state;
  }

  return false;
}

async function runActions(element: HTMLElement, actions: InteractionAction[], context: InteractionContext) {
  for (const action of actions) {
    if (action.type === "delay") {
      await wait(action.duration ?? 0);
      continue;
    }

    if (action.type === "navigate") {
      context.navigate(action.kind, action.target, action.newTab);
      continue;
    }

    if (action.type === "animate") {
      const target = getActionTarget(element, action.target, context);

      if (target) {
        await waitForAnimation(runAppearAnimation(target, action.spec));
      }

      continue;
    }

    if (action.type === "scrollTo") {
      const target = context.resolveNode(action.target);

      if (target) {
        target.scrollIntoView({ behavior: action.behavior ?? "smooth", block: action.block ?? "center" });
      }

      continue;
    }

    if (action.type === "setClass") {
      const target = getActionTarget(element, action.target, context);

      if (target && action.className.trim()) {
        const className = action.className.trim();
        const mode = action.mode ?? "toggle";

        if (mode === "add") target.classList.add(className);
        if (mode === "remove") target.classList.remove(className);
        if (mode === "toggle") target.classList.toggle(className);
      }

      continue;
    }

    if (action.type === "setStyle") {
      const target = getActionTarget(element, action.target, context);

      if (target) {
        await applyStyle(target, action);
      }

      continue;
    }

    if (action.type === "setState") {
      const target = getActionTarget(element, action.target, context);

      if (target) {
        setElementState(target, action.state, action.mode);
      }

      continue;
    }

    if (action.type === "toggleVisibility") {
      const target = context.resolveNode(action.target);

      if (target) {
        setElementVisibility(target, action.mode);
      }
    }
  }
}

function runInteraction(element: HTMLElement, interaction: Interaction, runnable: InteractionAction[], context: InteractionContext) {
  if (!passesCondition(element, interaction.condition, context)) {
    return;
  }

  void runActions(element, runnable, context);
}

/**
 * Attach every interaction of a node to its DOM element.
 * Returns a cleanup function; safe to call in React effects.
 */
export function bindInteractions(element: HTMLElement, interactions: Interaction[] | undefined, context: InteractionContext): () => void {
  if (!interactions || interactions.length === 0) {
    return () => undefined;
  }

  const cleanups: Array<() => void> = [];

  for (const interaction of interactions) {
    const { actions, trigger } = interaction;
    const hoverStyle = actions.find((action) => action.type === "hoverStyle");

    if (trigger.type === "hover" && hoverStyle) {
      cleanups.push(bindHoverPreset(element, hoverStyle.preset));
    }

    const runnable = actions.filter((action) => action.type !== "hoverStyle");

    if (runnable.length === 0) {
      continue;
    }

    if (trigger.type === "click" || trigger.type === "doubleClick" || trigger.type === "mouseDown" || trigger.type === "mouseUp") {
      const handleClick = (event: Event) => {
        event.stopPropagation();
        runInteraction(element, interaction, runnable, context);
      };
      const eventName = trigger.type === "doubleClick" ? "dblclick" : trigger.type === "mouseDown" ? "mousedown" : trigger.type === "mouseUp" ? "mouseup" : "click";
      element.addEventListener(eventName, handleClick);
      element.style.cursor = "pointer";
      cleanups.push(() => element.removeEventListener(eventName, handleClick));
      continue;
    }

    if (trigger.type === "hover") {
      const handleEnter = () => runInteraction(element, interaction, runnable, context);
      element.addEventListener("mouseenter", handleEnter);
      cleanups.push(() => element.removeEventListener("mouseenter", handleEnter));
      continue;
    }

    if (trigger.type === "focusWithin") {
      const handleFocus = () => runInteraction(element, interaction, runnable, context);
      element.addEventListener("focusin", handleFocus);
      cleanups.push(() => element.removeEventListener("focusin", handleFocus));
      continue;
    }

    if (trigger.type === "inputChange") {
      const handleInput = () => runInteraction(element, interaction, runnable, context);
      element.addEventListener("input", handleInput);
      element.addEventListener("change", handleInput);
      cleanups.push(() => {
        element.removeEventListener("input", handleInput);
        element.removeEventListener("change", handleInput);
      });
      continue;
    }

    if (trigger.type === "formSubmit") {
      const handleSubmit = () => runInteraction(element, interaction, runnable, context);
      element.addEventListener("submit", handleSubmit);
      cleanups.push(() => element.removeEventListener("submit", handleSubmit));
      continue;
    }

    if (trigger.type === "pageLoad") {
      const timer = window.setTimeout(() => runInteraction(element, interaction, runnable, context), trigger.delay ?? 0);
      cleanups.push(() => window.clearTimeout(timer));
      continue;
    }

    if (trigger.type === "viewEnter") {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              runInteraction(element, interaction, runnable, context);
              observer.disconnect();
            }
          }
        },
        { threshold: trigger.threshold ?? 0.12 }
      );
      observer.observe(element);
      cleanups.push(() => observer.disconnect());
    }
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

/** Convenience: the viewEnter+animate interaction a node uses for scroll reveal, if any. */
export function getAppearInteraction(interactions: Interaction[] | undefined): AnimationSpec | null {
  if (!interactions) {
    return null;
  }

  for (const interaction of interactions) {
    if (interaction.trigger.type !== "viewEnter" && interaction.trigger.type !== "pageLoad") {
      continue;
    }

    const animate = interaction.actions.find((action) => action.type === "animate");

    if (animate && animate.type === "animate" && !animate.target) {
      return animate.spec;
    }
  }

  return null;
}

export function createInteractionId() {
  return `ix-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
