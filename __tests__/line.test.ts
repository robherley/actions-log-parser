import { Line, Command } from "../src/line";
import * as ansi from "../src/ansi";

describe("Line", () => {
  describe("new", () => {
    test("constructor", () => {
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
          [0, [{ code: ansi.Code.SetFG8, args: [1] }]],
          [3, [{ code: ansi.Code.Reset }]],
        ])
      );
    });
  });

  describe("extractTimestamp", () => {
    test("from content", () => {
      const line = "2024-01-15T00:14:43.5805748Z foo";
      const [ts, content] = Line.extractTimestamp(line);
      expect(ts).toEqual(new Date("2024-01-15T00:14:43.580Z"));
      expect(content).toEqual("foo");
    });

    test("from id", () => {
      const line = "foo";
      const [ts, content] = Line.extractTimestamp(line, "1705277683580-0");
      expect(ts).toEqual(new Date(1705277683580));
      expect(content).toEqual(line);
    });

    test("no timestamp", () => {
      const line = "hello";
      const [ts, content] = Line.extractTimestamp(line);
      expect(ts).not.toBeNull();
      expect(content).toEqual("hello");
    });
  });

  describe("extractCommand", () => {
    Object.values(Command).forEach((cmd) => {
      test(`from ##[${cmd}]`, () => {
        const line = `##[${cmd}]foobar`;
        const result = Line.extractCommand(line);
        expect(result[0]).toEqual(cmd);
        expect(result[1]).toEqual("foobar");
      });

      test(`from [${cmd}]`, () => {
        const line = `[${cmd}]foobar`;
        const result = Line.extractCommand(line);
        expect(result[0]).toEqual(cmd);
        expect(result[1]).toEqual("foobar");
      });
    });

    test("no command", () => {
      const line = "hello";
      const result = Line.extractCommand(line);
      expect(result[0]).toBeUndefined();
      expect(result[1]).toEqual("hello");
    });

    test("invalid command", () => {
      const line = "##[foo]";
      const result = Line.extractCommand(line);
      expect(result[0]).toBeUndefined();
      expect(result[1]).toEqual(line);
    });
  });

  describe("extractLinks", () => {
    test("with links", () => {
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

    test("no links", () => {
      const line = "foo bar";
      const links = Line.extractLinks(line);
      expect(links.size).toBe(0);
    });
  });
});
