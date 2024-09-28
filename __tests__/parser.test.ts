import { Line, Command } from "../src/line";
import { Parser } from "../src/parser";

describe("Parser", () => {
  it("adds a line with correct idx", () => {
    const parser = new Parser();
    parser.add("hello");
    expect(parser.lines).toHaveLength(1);
    expect(parser.lines[0]).toBeInstanceOf(Line);
    expect(parser.lines[0].n).toEqual(1);
  });

  it("adds a line and opens a group", () => {
    const parser = new Parser();
    parser.add("##[group]hello");
    expect(parser.lines).toHaveLength(1);
    expect(parser.inGroup()).toBe(true);
    parser.add("world");
    expect(parser.inGroup()).toBe(true);
    parser.add("##[endgroup]");
    expect(parser.inGroup()).toBe(false);
  });

  it("parses multiple lines with multiple groups", () => {
    const lines = [
      "2024-01-15T00:14:49.2830954Z ##[group]Operating System",
      "2024-01-15T00:14:49.2831846Z Ubuntu",
      "2024-01-15T00:14:49.2832204Z 22.04.3",
      "2024-01-15T00:14:49.2832638Z LTS",
      "2024-01-15T00:14:49.2833085Z ##[endgroup]",
      "2024-01-15T00:14:49.2833509Z ##[group]Runner Image",
      "2024-01-15T00:14:49.2834023Z Image: ubuntu-22.04",
      "2024-01-15T00:14:49.2834552Z Version: 20240107.1.0",
      "2024-01-15T00:14:49.2835705Z Included Software: https://github.com/actions/runner-images/blob/ubuntu22/20240107.1/images/ubuntu/Ubuntu2204-Readme.md",
      "2024-01-15T00:14:49.2837409Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu22%2F20240107.1",
      "2024-01-15T00:14:49.2838476Z ##[endgroup]",
      "2024-01-15T00:14:49.2838965Z ##[group]Runner Image Provisioner",
      "2024-01-15T00:14:49.2839497Z 2.0.321.1",
      "2024-01-15T00:14:49.2839965Z ##[endgroup]",
    ];
    const parser = new Parser();
    for (const line of lines) {
      parser.add(line);
    }

    expect(parser.lines).toHaveLength(3);

    const expectedChildren = [3, 4, 1];
    parser.lines.forEach((line, i) => {
      expect(line.cmd).toEqual(Command.Group);
      expect(line.group?.children).toHaveLength(expectedChildren[i]);
    });
  });

  it("handles weird endgroups behavior", () => {
    const lines = [
      "##[group]start group",
      "inside group",
      "##[endgroup]",
      "outside group",
      "##[group]start another group",
      "inside another group",
      "##[endgroup]",
      "##[endgroup]",
      "##[endgroup]",
    ];

    const parser = new Parser();
    for (const line of lines) {
      parser.add(line);
    }

    expect(parser.lines).toHaveLength(5);
    expect(parser.lines.map((e) => e.cmd)).toEqual([
      Command.Group,
      undefined,
      Command.Group,
      Command.EndGroup,
      Command.EndGroup,
    ]);
  });

  it("searches lines", () => {
    const lines = ["foo", "bar", "baz"];

    const parser = new Parser();
    for (const line of lines) {
      parser.add(line);
    }

    const matches = parser.setSearch("bar");
    expect(matches).toBe(1);

    parser.add("----> bar <----");
    expect(parser.getMatches()).toBe(2);
  });
});
