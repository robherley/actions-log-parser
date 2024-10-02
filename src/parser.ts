import { Line, Command } from "./line";

export type LinePointer = number | [number, number];

export class LogParser {
  counter: number;
  seenIDs: Set<string>;
  search: string;
  matches: number;
  lines: Line[];
  _visibleLines?: LinePointer[];
  onVisibleLinesChange?: (lines?: LinePointer[]) => void;

  constructor() {
    this.counter = 1;
    this.seenIDs = new Set();
    this.search = "";
    this.matches = 0;
    this.lines = [];
  }

  reset() {
    this.counter = 1;
    this.seenIDs = new Set();
    this.matches = 0;
    this.lines = [];
    this.resetVisibleLines();
  }

  getVisibleLines(): LinePointer[] {
    if (this._visibleLines) {
      return this._visibleLines;
    }

    // build a mapping of visible lines to their locations in the array for fast lookups
    this._visibleLines = [];
    for (let i = 0; i < this.lines.length; i++) {
      this._visibleLines.push(i);

      const line = this.lines[i];
      if (line.group?.open) {
        // if we're in an open group, add all of its children
        for (let j = 0; j < line.group.children.length; j++) {
          this._visibleLines.push([i, j]);
        }
        continue;
      }
    }

    this.onVisibleLinesChange?.(this._visibleLines);
    return this._visibleLines;
  }

  getVisibleLine(idx: number): Line | undefined {
    const mapping = this.getVisibleLines()[idx];
    if (typeof mapping === "undefined") {
      return;
    }
    if (typeof mapping === "number") {
      return this.lines[mapping];
    }
    return this.lines[mapping[0]].group?.children[mapping[1]];
  }

  resetVisibleLines() {
    this._visibleLines = undefined;
    this.onVisibleLinesChange?.(this.getVisibleLines());
  }

  add(raw: string, id?: string) {
    if (id) {
      if (this.seenIDs.has(id)) {
        return;
      }

      this.seenIDs.add(id);
    }

    const line = new Line(this.counter, raw, id);
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
        // add a callback to reset visible lines when the group changes
        line.group!.onGroupChange(() => this.resetVisibleLines());

        // we'll want to close any open group
        this.endGroup();
        this.lines.push(line);
        break;
      }
      default: {
        if (this.inGroup()) {
          // in a group, add it to said group
          line.parent = this.last();
          this.last()?.group!.children.push(line);
        } else {
          // otherwise, add it as a regular line
          this.lines.push(line);
        }
      }
    }

    this.counter++;
    this.matches += line.highlights.size;
    this.resetVisibleLines();
  }

  addRaw(raw: string) {
    raw.split("\n").forEach((line) => this.add(line));
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
