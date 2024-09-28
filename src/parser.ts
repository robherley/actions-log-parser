import { Line, Command } from "./line";

export class Parser {
  private idx: number;
  private seenIDs: Set<string>;
  private search: string;
  private matches: number;
  readonly lines: Line[];

  constructor() {
    this.idx = 1;
    this.seenIDs = new Set();
    this.search = "";
    this.matches = 0;
    this.lines = [];
  }

  add(raw: string, id?: string) {
    if (id) {
      if (this.seenIDs.has(id)) {
        return;
      }

      this.seenIDs.add(id);
    }

    const line = new Line(this.idx, raw, id);
    if (this.search) {
      line.highlight(this.search);
    }

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
    this.matches += line.highlights.size;
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

  setSearch(search: string): number {
    this.matches = 0;
    this.search = search;
    for (let line of this.lines) {
      this.matches += line.highlight(search);
    }
    return this.matches;
  }

  getMatches(): number {
    return this.matches;
  }
}
