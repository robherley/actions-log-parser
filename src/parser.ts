import { Line, Command } from "./line";

export class Parser {
  private idx: number;
  private search: string;
  lines: Line[];

  constructor() {
    this.idx = 1;
    this.lines = [];
    this.search = "";
  }

  reset() {
    this.idx = 1;
    this.lines = [];
    this.search = "";
  }

  add(raw: string, id?: string) {
    const line = new Line(this.idx, raw, id);
    switch (line.cmd) {
      case Command.EndGroup: {
        if (this.inGroup()) {
          this.endGroup();
          // don't add endgroup lines when they properly close a group
          // also don't increment the index
          return;
        }

        // if not in group, treat endgroup as a regular line
        this.lines.push(line);
        break;
      }
      case Command.Group: {
        // close any open group
        this.endGroup();
        this.lines.push(line);
        break;
      }
      default: {
        if (this.inGroup()) {
          // in a group, add it to said group
          this.last()?.group!.children.push(line);
        } else {
          // otherwise, add it as a regular line
          this.lines.push(line);
        }
      }
    }

    this.idx++;
  }

  last(): Line {
    return this.lines[this.lines.length - 1];
  }

  inGroup() {
    let group = this.last()?.group;
    return group && !group.ended;
  }

  endGroup() {
    if (this.inGroup()) {
      this.last().group!.end();
    }
  }

  getSearch(): string {
    return this.search;
  }

  setSearch(search: string) {
    this.search = search;
    for (let line of this.lines) {
      line.highlight(search);
    }
  }
}
