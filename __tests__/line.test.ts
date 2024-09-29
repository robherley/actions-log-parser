import { Line, Command } from "../src/line";
import { ANSICode } from "../src/ansi";

describe("Line", () => {
  describe("new", () => {
    it("constructor", () => {
      const line = new Line(
        123,
        "2024-01-15T00:14:43.5805748Z ##[warning]\u{1b}[31mfoo\u{1b}[0m example.com bar"
      );
      expect(line.n).toEqual(123);
      expect(line.ts).toEqual(new Date("2024-01-15T00:14:43.580Z"));
      expect(line.cmd).toBe(Command.Warning);
      expect(line.links.size).toBe(1);
      expect(line.content).toEqual("foo example.com bar");
      expect(line.ansis).toEqual(
        new Map([
          [0, [{ code: ANSICode.SetFG8, args: [1] }]],
          [3, [{ code: ANSICode.Reset }]],
        ])
      );
    });
  });

  describe("extractTimestamp", () => {
    it("from content", () => {
      const line = "2024-01-15T00:14:43.5805748Z foo";
      const [ts, content] = Line.extractTimestamp(line);
      expect(ts).toEqual(new Date("2024-01-15T00:14:43.580Z"));
      expect(content).toEqual("foo");
    });

    it("from id", () => {
      const line = "foo";
      const [ts, content] = Line.extractTimestamp(line, "1705277683580-0");
      expect(ts).toEqual(new Date(1705277683580));
      expect(content).toEqual(line);
    });

    it("no timestamp", () => {
      const line = "hello";
      const [ts, content] = Line.extractTimestamp(line);
      expect(ts).not.toBeNull();
      expect(content).toEqual("hello");
    });
  });

  describe("extractCommand", () => {
    Object.values(Command).forEach((cmd) => {
      it(`from ##[${cmd}]`, () => {
        const line = `##[${cmd}]foobar`;
        const result = Line.extractCommand(line);
        expect(result[0]).toEqual(cmd);
        expect(result[1]).toEqual("foobar");
      });

      it(`from [${cmd}]`, () => {
        const line = `[${cmd}]foobar`;
        const result = Line.extractCommand(line);
        expect(result[0]).toEqual(cmd);
        expect(result[1]).toEqual("foobar");
      });
    });

    it("no command", () => {
      const line = "hello";
      const result = Line.extractCommand(line);
      expect(result[0]).toBeUndefined();
      expect(result[1]).toEqual("hello");
    });

    it("invalid command", () => {
      const line = "##[foo]";
      const result = Line.extractCommand(line);
      expect(result[0]).toBeUndefined();
      expect(result[1]).toEqual(line);
    });
  });

  describe("extractLinks", () => {
    it("with links", () => {
      const line = "foo https://example.com bar reb.gg";
      const links = Line.extractLinks(line);
      expect(links.size).toBe(2);
      expect(links).toEqual(
        new Map([
          [4, 23],
          [28, 34],
        ])
      );
    });

    it("no links", () => {
      const line = "foo bar";
      const links = Line.extractLinks(line);
      expect(links.size).toBe(0);
    });
  });

  describe("highlight", () => {
    it("matches", () => {
      const line = new Line(0, "foo bar baz bAr");
      const matches = line.highlight("bar");
      expect(line.highlights).toEqual(
        new Map([
          [4, 7],
          [12, 15],
        ])
      );
      expect(matches).toBe(2);
    });

    it("mixed cases", () => {
      const line = new Line(0, "foo bar baz bAr");
      expect(line.highlight("BAR")).toBe(2);
      expect(line.highlights).toEqual(
        new Map([
          [4, 7],
          [12, 15],
        ])
      );
    });

    it("clears", () => {
      const line = new Line(0, "foo bar baz bAr");
      expect(line.highlight("bar")).toBe(2);
      expect(line.highlights).toEqual(
        new Map([
          [4, 7],
          [12, 15],
        ])
      );

      expect(line.highlight("")).toBe(0);
      expect(line.highlights.size).toBe(0);
    });

    it("nested", () => {
      const line = new Line(0, "##[group]foo bar baz");
      line.group?.children.push(new Line(1, "foo bar baz"));
      expect(line.highlight("bar")).toBe(2);
      expect(line.highlights).toEqual(new Map([[4, 7]]));
      expect(line.group?.children[0].highlights).toEqual(new Map([[4, 7]]));
    });
  });
});
