import * as ansi from "./ansi";
import * as linkify from "linkifyjs";

// https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions
export enum Command {
  Command = "command",
  Debug = "debug",
  Error = "error",
  Info = "info",
  Notice = "notice",
  Verbose = "verbose",
  Warning = "warning",
  Group = "group",
  EndGroup = "endgroup",
}

export class Group {
  children: Line[] = [];
  ended: boolean = false;
  open: boolean = true;

  end() {
    this.ended = true;
    this.open = false;
  }
}

export class Line {
  n: number;
  ts: Date;
  cmd?: Command;
  ansis: ansi.SequenceMap;
  links: Map<number, number>;
  highlights: Map<number, number>;
  content: string;
  group?: Group;

  constructor(number: number, raw: string, id?: string) {
    let [ts, withoutTS] = Line.extractTimestamp(raw, id);
    let [cmd, withoutCMD] = Line.extractCommand(withoutTS);
    let [ansis, content] = ansi.extract(withoutCMD);
    this.n = number;
    this.ts = ts;
    this.cmd = cmd;
    this.ansis = ansis;
    this.content = content;
    this.links = Line.extractLinks(content);
    this.highlights = new Map();

    if (this.isGroup()) {
      this.group = new Group();
    }
  }

  isGroup(): boolean {
    return this.cmd === Command.Group;
  }

  highlight(search: string) {
    this.highlights.clear();
    if (search) {
      [...this.content.matchAll(new RegExp(search, "gi"))].forEach((m) => {
        this.highlights.set(m.index, m.index + m[0].length);
      });
    }

    // TODO: clear rendered element cache

    if (this.isGroup()) {
      this.group?.children.forEach((line) => line.highlight(search));
    }
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
    const found = linkify.find(line, "url");
    return new Map(found.map((f) => [f.start, f.end]));
  }
}
