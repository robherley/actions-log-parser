import { Line } from "../src/line";
import { Styles } from "../src/styles";
import { ElementsBuilder } from "../src/elements";

describe("build", () => {
  it("text", () => {
    const line = new Line(1, "foo bar");
    const elements = ElementsBuilder.build(line);
    expect(elements).toEqual(["foo bar"]);
  });

  it("link", () => {
    const line = new Line(1, "foo https://reb.gg bar");
    const elements = ElementsBuilder.build(line);
    expect(elements).toEqual([
      "foo ",
      {
        href: "https://reb.gg",
        children: ["https://reb.gg"],
      },
      " bar",
    ]);
  });

  it("ends with link", () => {
    const line = new Line(1, "foo https://reb.gg");
    const elements = ElementsBuilder.build(line);
    expect(elements).toEqual([
      "foo ",
      {
        href: "https://reb.gg",
        children: ["https://reb.gg"],
      },
    ]);
  });

  it("highlights", () => {
    const line = new Line(1, "foo bar baz");
    line.highlight("bar");
    const elements = ElementsBuilder.build(line);
    expect(elements).toEqual([
      "foo ",
      {
        content: "bar",
        style: new Styles({ highlight: true }),
      },
      " baz",
    ]);
  });

  it("ansis", () => {
    const line = new Line(1, "\u{1b}[36;1mbold cyan\u{1b}[0m");
    const elements = ElementsBuilder.build(line);
    expect(elements).toEqual([
      {
        content: "bold cyan",
        style: new Styles({ bold: true, color: 6 }),
      },
    ]);
  });

  it("mixed", () => {
    const line = new Line(
      1,
      "do re me https://\u{1b}[31mreb.gg\u{1b}[0m fa la ti do"
    );
    line.highlight("re");
    const elements = ElementsBuilder.build(line);
    expect(elements).toEqual([
      "do ",
      {
        content: "re",
        style: new Styles({ highlight: true }),
      },
      " me ",
      {
        href: "https://reb.gg",
        children: [
          "https://",
          {
            content: "re",
            style: new Styles({ color: 1, highlight: true }),
          },
          {
            content: "b.gg",
            style: new Styles({ color: 1 }),
          },
        ],
      },
      " fa la ti do",
    ]);
  });
});
