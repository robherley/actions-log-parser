import { CSSProperties } from "react";
import { Command, type Color, type Styles } from "../../../src/index";

export function commandToLineContainerClass(command?: Command): string {
  switch (command) {
    case Command.Error:
      return "color-bg-danger";
    case Command.Warning:
      return "color-bg-attention";
    default:
      return "";
  }
}

export function commandToLineContentClass(command?: Command): string {
  switch (command) {
    case Command.Command:
      return "color-fg-accent";
    case Command.Debug:
      return "color-fg-done";
    case Command.Section:
      return "text-bold color-fg-success";
    default:
      return "";
  }
}

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

  const name = colors[color];

  if (!name) {
    return "inherit";
  }

  return `var(--color-ansi-${name})`;
};
