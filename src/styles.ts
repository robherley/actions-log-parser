import { ANSISequence, ANSICode } from "./ansi";

export type Color = number | [number, number, number];

export interface StylesOptions {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  highlight?: boolean;
  color?: Color;
  background?: Color;
}

export class Styles {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  highlight: boolean;
  color?: Color;
  background?: Color;

  constructor({
    bold = false,
    italic = false,
    underline = false,
    highlight = false,
    color = undefined,
    background = undefined,
  }: StylesOptions = {}) {
    this.bold = bold;
    this.italic = italic;
    this.underline = underline;
    this.highlight = highlight;
    this.color = color;
    this.background = background;
  }

  copy(): Styles {
    return new Styles({
      bold: this.bold,
      italic: this.italic,
      underline: this.underline,
      highlight: this.highlight,
      color: this.color,
      background: this.background,
    });
  }

  equals(other: Styles): boolean {
    return (
      this.bold === other.bold &&
      this.italic === other.italic &&
      this.underline === other.underline &&
      this.highlight === other.highlight &&
      this.color === other.color &&
      this.background === other.background
    );
  }

  isEmpty(): boolean {
    return (
      !this.bold &&
      !this.italic &&
      !this.underline &&
      !this.highlight &&
      !this.color &&
      !this.background
    );
  }

  applyANSIs(seqs: ANSISequence[]) {
    for (const seq of seqs) {
      this.applyANSI(seq);
    }
  }

  applyANSI(seq: ANSISequence) {
    switch (seq.code) {
      case ANSICode.Reset:
        this.bold = false;
        this.italic = false;
        this.underline = false;
        this.color = undefined;
        this.background = undefined;
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
          this.color = seq.args[0];
        }
        break;
      case ANSICode.DefaultFG:
        this.color = undefined;
        break;
      case ANSICode.SetBG8:
        if (seq.args?.length === 1) {
          this.background = seq.args[0];
        }
        break;
      case ANSICode.DefaultBG:
        this.background = undefined;
        break;
      case ANSICode.SetFG24:
        if (seq.args?.length === 3) {
          const [r, g, b] = seq.args;
          this.color = [r, g, b];
        }
        break;
      case ANSICode.SetBG24:
        if (seq.args?.length === 3) {
          const [r, g, b] = seq.args;
          this.background = [r, g, b];
        }
        break;
    }
  }
}
