import { Line } from "./line.js";
import { Styles } from "./styles.js";

export type Element = LinkElement | TextElement;
export type TextElement = StyledText | string;

export interface LinkElement {
  href: string;
  children: TextElement[];
}

export interface StyledText {
  content: string;
  style: Styles;
}

export class ElementsBuilder {
  elements: Element[] = [];
  text: string;
  styles: Styles;
  endHighlightIdx?: number;
  endLinkIdx?: number;
  parent?: LinkElement;

  constructor() {
    this.elements = [];
    this.text = "";
    this.styles = new Styles();
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

    let textElement: TextElement;

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

  static build(line: Line): Element[] {
    return new ElementsBuilder().elementsFor(line);
  }
}
