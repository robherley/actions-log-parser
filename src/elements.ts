import { Line } from "./line";
import { Style } from "./style";

export type Element = Link | Text;
export type Text = StyledText | string;

export interface Link {
  href: string;
  children: Text[];
}

export interface StyledText {
  content: string;
  style: Style;
}

class Builder {
  elements: Element[] = [];
  text: string;
  styles: Style;
  endHighlightIdx?: number;
  endLinkIdx?: number;
  parent?: Link;

  constructor() {
    this.elements = [];
    this.text = "";
    this.styles = new Style();
  }

  elementsFor(line: Line): Element[] {
    for (let i = 0; i < line.content.length; i++) {
      const newStyles = this.styles.copy();

      // starting a link element
      if (line.links.has(i)) {
        this.flush();
        this.parent = {
          href: line.content.substring(i, line.links.get(i)),
          children: [],
        };
        this.endLinkIdx = line.links.get(i);
      }

      // ending a link element
      if (i == this.endLinkIdx) {
        this.flush();
        if (this.parent) {
          this.elements.push(this.parent);
        }
        this.parent = undefined;
        this.endLinkIdx = undefined;
      }

      // starting a highlight
      if (line.highlights.has(i)) {
        newStyles.highlight = true;
        this.endHighlightIdx = line.highlights.get(i);
      }

      // ending a highlight
      if (i == this.endHighlightIdx) {
        newStyles.highlight = false;
        this.endHighlightIdx = undefined;
      }

      // adding an ANSI sequence
      if (line.ansis.has(i)) {
        newStyles.applyANSIs(line.ansis.get(i) || []);
      }

      // check if styles changed
      if (!newStyles.equals(this.styles)) {
        this.flush();
        this.styles = newStyles;
      }

      this.text += line.content[i];
    }

    this.flush();
    if (this.parent) {
      this.elements.push(this.parent);
    }

    return this.elements;
  }

  private flush() {
    if (!this.text) {
      return;
    }

    let textElement: Text;

    if (this.styles.isEmpty()) {
      textElement = this.text;
    } else {
      textElement = {
        content: this.text,
        style: this.styles,
      };
    }

    if (this.parent) {
      this.parent.children.push(textElement);
    } else {
      this.elements.push(textElement);
    }

    this.text = "";
  }
}

export function build(line: Line): Element[] {
  return new Builder().elementsFor(line);
}
