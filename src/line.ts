import { ANSISequenceMap, extractANSI } from "./ansi.js";
import { Element, ElementsBuilder } from "./elements.js";
import { find } from "linkifyjs";

/**
 * GitHub Actions workflow command types
 * @see https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions
 */
export enum Command {
  Command = "command",
  Debug = "debug",
  Error = "error",
  Section = "section",
  Warning = "warning",
  Group = "group",
  EndGroup = "endgroup",
  Notice = "notice",
  // These exist in source code, but don't seem to be actually used.
  // Plain = "plain",
  // Info = "info",
  // Verbose = "verbose",
  // Info = "info",
}

/**
 * Represents a collapsible group of log lines
 */
export class Group {
  children: Line[] = [];
  ended: boolean = false;
  _open: boolean = true;
  _cb?: (open: boolean) => void;

  get open(): boolean {
    return this._open;
  }

  set open(open: boolean) {
    this._open = open;
    if (this._cb) {
      this._cb(open);
    }
  }

  onGroupChange(callback: (open: boolean) => void) {
    this._cb = callback;
  }

  end() {
    this.ended = true;
    this.open = false;
  }
}

/**
 * Represents a single line in a GitHub Actions log with all its parsed content
 */
export class Line {
  n: number;
  ts: Date;
  cmd?: Command;
  ansis: ANSISequenceMap;
  links: Map<number, number>;
  highlights: Map<number, number>;
  content: string;
  group?: Group;
  parent?: Line;
  _elements?: Element[];

  constructor(number: number, raw: string, id?: string) {
    let [ts, withoutTS] = Line.extractTimestamp(raw, id);
    let [cmd, withoutCMD] = Line.extractCommand(withoutTS);
    let [ansis, content] = extractANSI(withoutCMD);
    this.n = number;
    this.ts = ts;
    this.cmd = cmd;
    this.ansis = ansis;
    this.content = content;
    this.links = Line.extractLinks(content);
    this.highlights = new Map();

    if (this.cmd === Command.Group) {
      this.group = new Group();
    }
  }

  highlight(search: string): number {
    let matches = 0;
    this.highlights.clear();
    if (search) {
      [...this.content.matchAll(new RegExp(search, "gi"))].forEach((m) => {
        this.highlights.set(m.index, m.index + m[0].length);
      });
    }

    matches += this.highlights.size;

    this._elements = undefined;

    if (this.group) {
      this.group.children.forEach(
        (line) => (matches += line.highlight(search))
      );
    }

    return matches;
  }

  elements(): Element[] {
    if (this._elements) {
      return this._elements;
    }

    this._elements = ElementsBuilder.build(this);
    return this._elements;
  }

  static extractTimestamp(line: string, id?: string): [Date, string] {
    // extract timestamp from beginning of line (completed logs)
    if (line.length >= 28) {
      const timestamp = line.slice(0, 28);
      const rest = line.slice(29);
      const ts = new Date(timestamp);
      if (!isNaN(ts.getDate())) {
        return [ts, rest];
      }
    }

    // extract timestamp from id e.g. 1696290982067-0 (streaming logs)
    if (id) {
      const timestamp = id.split("-")[0];
      const ts = new Date(parseInt(timestamp));
      if (!isNaN(ts.getDate())) {
        return [ts, line];
      }
    }

    // otherwise, default to current time
    return [new Date(), line];
  }

  static extractCommand(line: string): [Command | undefined, string] {
    let start;
    if (line.startsWith("##[")) {
      start = 3;
    } else if (line.startsWith("[")) {
      start = 1;
    } else {
      return [undefined, line];
    }

    const end = line.indexOf("]");
    if (end === -1) {
      return [undefined, line];
    }

    const cmd = line.slice(start, end);
    if (Object.values(Command).includes(cmd as Command)) {
      return [cmd as Command, line.slice(end + 1)];
    }

    return [undefined, line];
  }

  static extractLinks(line: string): Map<number, number> {
    const found = find(line, "url");
    return new Map(found.map((f) => [f.start, f.end]));
  }
}
