import { CSSProperties } from "react";
import type { Color, Styles } from "../../../src/index";

export function stylesToAttributes(styles: Styles): {
  style: CSSProperties;
  className: string;
} {
  const css: CSSProperties = {};
  const classNames: string[] = [];

  if (styles.bold) {
    css.fontWeight = "bold";
  }

  if (styles.italic) {
    css.fontStyle = "italic";
  }

  if (styles.underline) {
    css.textDecoration = "underline";
  }

  if (styles.highlight) {
    classNames.push("color-fg-on-emphasis", "color-bg-attention-emphasis");
    // comes from dt-fm class
    css.paddingTop = "2px";
    css.paddingBottom = "1px";
    css.borderRadius = "2px";
  }

  if (typeof styles.fg !== "undefined") {
    css.color = cssColorFor(styles.fg);
  }

  if (typeof styles.bg !== "undefined") {
    css.backgroundColor = cssColorFor(styles.bg);
  }

  return { style: css, className: classNames.join(" ") };
}

const colors = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "black-bright",
  "red-bright",
  "green-bright",
  "yellow-bright",
  "blue-bright",
  "magenta-bright",
  "cyan-bright",
  "white-bright",
];

const cssColorFor = (color: Color): string => {
  if (Array.isArray(color)) {
    return `rgb(${color.join(",")})`;
  }

  console.log("color", color);

  const name = colors[color];

  if (!name) {
    console.log("unknown color", color);
    return "inherit";
  }

  return `var(--color-ansi-${name})`;
};
