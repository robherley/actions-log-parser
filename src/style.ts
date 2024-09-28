import * as ansi from "./ansi";

type Color = number | [number, number, number];

export interface StyleOptions {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  highlight?: boolean;
  color?: Color;
  background?: Color;
}

export class Style {
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
  }: StyleOptions = {}) {
    this.bold = bold;
    this.italic = italic;
    this.underline = underline;
    this.highlight = highlight;
    this.color = color;
    this.background = background;
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

  applyANSIs(seqs: ansi.Sequence[]) {
    for (const seq of seqs) {
      this.applyANSI(seq);
    }
  }

  applyANSI(seq: ansi.Sequence) {
    switch (seq.code) {
      case ansi.Code.Reset:
        this.bold = false;
        this.italic = false;
        this.underline = false;
        this.color = undefined;
        this.background = undefined;
        // note: does not reset highlight
        break;
      case ansi.Code.Bold:
        this.bold = true;
        break;
      case ansi.Code.Italic:
        this.italic = true;
        break;
      case ansi.Code.Underline:
        this.underline = true;
        break;
      case ansi.Code.NotBold:
        this.bold = false;
        break;
      case ansi.Code.NotItalic:
        this.italic = false;
        break;
      case ansi.Code.NotUnderline:
        this.underline = false;
        break;
      case ansi.Code.SetFG8:
        if (seq.args?.length === 1) {
          this.color = seq.args[0];
        }
        break;
      case ansi.Code.DefaultFG:
        this.color = undefined;
        break;
      case ansi.Code.SetBG8:
        if (seq.args?.length === 1) {
          this.background = seq.args[0];
        }
        break;
      case ansi.Code.DefaultBG:
        this.background = undefined;
        break;
      case ansi.Code.SetFG24:
        if (seq.args?.length === 3) {
          const [r, g, b] = seq.args;
          this.color = [r, g, b];
        }
        break;
      case ansi.Code.SetBG24:
        if (seq.args?.length === 3) {
          const [r, g, b] = seq.args;
          this.background = [r, g, b];
        }
        break;
    }
  }
}
