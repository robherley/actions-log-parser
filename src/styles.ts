import { ANSISequence, ANSICode } from "./ansi.js";

/**
 * Color representation as either an 8-bit color index or RGB tuple
 */
export type Color = number | [number, number, number];

/**
 * Configuration options for text styling
 */
export interface StylesOptions {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  highlight?: boolean;
  fg?: Color;
  bg?: Color;
}

/**
 * Manages text styling properties including colors and formatting
 */
export class Styles {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  highlight: boolean;
  fg?: Color;
  bg?: Color;

  constructor({
    bold = false,
    italic = false,
    underline = false,
    highlight = false,
    fg = undefined,
    bg = undefined,
  }: StylesOptions = {}) {
    this.bold = bold;
    this.italic = italic;
    this.underline = underline;
    this.highlight = highlight;
    this.fg = fg;
    this.bg = bg;
  }

  /**
   * Creates a copy of this Styles instance
   * @returns A new Styles instance with the same properties
   */
  copy(): Styles {
    return new Styles({
      bold: this.bold,
      italic: this.italic,
      underline: this.underline,
      highlight: this.highlight,
      fg: this.fg,
      bg: this.bg,
    });
  }

  /**
   * Checks if this Styles instance is equal to another
   * @param other - The other Styles instance to compare with
   * @returns True if all properties are equal, false otherwise
   */
  equals(other: Styles): boolean {
    return (
      this.bold === other.bold &&
      this.italic === other.italic &&
      this.underline === other.underline &&
      this.highlight === other.highlight &&
      this.fg === other.fg &&
      this.bg === other.bg
    );
  }

  /**
   * Checks if this Styles instance has no styling applied
   * @returns True if no styling properties are set, false otherwise
   */
  isEmpty(): boolean {
    const hasFg = typeof this.fg !== "undefined";
    const hasBg = typeof this.bg !== "undefined";

    return (
      !this.bold &&
      !this.italic &&
      !this.underline &&
      !this.highlight &&
      !hasFg &&
      !hasBg
    );
  }

  /**
   * Applies multiple ANSI sequences to this Styles instance
   * @param seqs - Array of ANSI sequences to apply
   */
  applyANSIs(seqs: ANSISequence[]) {
    for (const seq of seqs) {
      this.applyANSI(seq);
    }
  }

  /**
   * Applies a single ANSI sequence to this Styles instance
   * @param seq - The ANSI sequence to apply
   */
  applyANSI(seq: ANSISequence) {
    switch (seq.code) {
      case ANSICode.Reset:
        this.bold = false;
        this.italic = false;
        this.underline = false;
        this.fg = undefined;
        this.bg = undefined;
        // note: does not reset highlight
        break;
      case ANSICode.Bold:
        this.bold = true;
        break;
      case ANSICode.Italic:
        this.italic = true;
        break;
      case ANSICode.Underline:
        this.underline = true;
        break;
      case ANSICode.NotBold:
        this.bold = false;
        break;
      case ANSICode.NotItalic:
        this.italic = false;
        break;
      case ANSICode.NotUnderline:
        this.underline = false;
        break;
      case ANSICode.SetFG8:
        if (seq.args?.length === 1) {
          this.fg = seq.args[0];
        }
        break;
      case ANSICode.DefaultFG:
        this.fg = undefined;
        break;
      case ANSICode.SetBG8:
        if (seq.args?.length === 1) {
          this.bg = seq.args[0];
        }
        break;
      case ANSICode.DefaultBG:
        this.bg = undefined;
        break;
      case ANSICode.SetFG24:
        if (seq.args?.length === 3) {
          const [r, g, b] = seq.args;
          this.fg = [r, g, b];
        }
        break;
      case ANSICode.SetBG24:
        if (seq.args?.length === 3) {
          const [r, g, b] = seq.args;
          this.bg = [r, g, b];
        }
        break;
    }
  }
}
