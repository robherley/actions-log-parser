import { Line, Command } from "./line";

export class Parser {
  private idx: number;
  private lines: Line[];
  private search: string;

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
    const line = new Line(this.idx++, raw, id);
    switch (line.cmd) {
      case Command.EndGroup: {
        if (this.inGroup()) {
          this.endGroup();
          // don't add endgroup lines when they properly close a group
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
          this.lines[this.lines.length - 1].group!.children.push(line);
        } else {
          // otherwise, add it as a regular line
          this.lines.push(line);
        }
      }
    }
  }

  inGroup() {
    let group = this.lines[this.lines.length - 1]?.group;
    return group && !group.ended;
  }

  endGroup() {
    if (this.inGroup()) {
      this.lines[this.lines.length - 1].group!.ended = true;
    }
  }

  getSearch(): string {
    return this.search;
  }

  setSearch(search: string) {
    this.search = search;
    for (let line of this.lines) {
      line.setSearch(search);
    }
  }
}
