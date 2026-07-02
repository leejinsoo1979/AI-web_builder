"use client";

import { bindInteractions, type Interaction, type InteractionContext } from "@webable/interaction-runtime";
import { useEffect, useRef } from "react";

type PublishedInteractionNodeProps = {
  children: React.ReactNode;
  className: string;
  interactions?: Interaction[];
  nodeId: string;
  pagePaths: Record<string, string>;
  style: React.CSSProperties;
};

export function PublishedInteractionNode({ children, className, interactions, nodeId, pagePaths, style }: PublishedInteractionNodeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const context: InteractionContext = {
      navigate: (kind, target, newTab) => {
        if (kind === "page") {
          const segments = window.location.pathname.split("/").filter(Boolean);
          const siteId = segments[0] === "p" && segments[1] ? segments[1] : "webable-main";
          const pagePath = pagePaths[target] || "/";
          const href = pagePath === "/" ? `/p/${siteId}` : `/p/${siteId}${pagePath}`;

          if (newTab) {
            window.open(href, "_blank", "noopener");
          } else {
            window.location.href = href;
          }
          return;
        }

        if (kind === "url") {
          window.open(target, newTab ? "_blank" : "_self", "noopener");
          return;
        }

        if (kind === "anchor") {
          document.querySelector(`[data-node-id="${target}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }

        window.location.href = `mailto:${target}`;
      },
      resolveNode: (targetId) => document.querySelector(`[data-node-id="${targetId}"]`)
    };

    return bindInteractions(element, interactions, context);
  }, [interactions, pagePaths]);

  return (
    <div className={className} data-node-id={nodeId} ref={ref} style={style}>
      {children}
    </div>
  );
}
