import { Line } from "./line";

export class Parser {
  private idx: number;
  private lines: Line[];
  search: string;

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

  add(line: string) {
    this.lines.push(new Line(this.idx++, line));
  }

  setSearch(search: string) {
    this.search = search;
    for (let line of this.lines) {
      line.setSearch(search);
    }
  }
}
