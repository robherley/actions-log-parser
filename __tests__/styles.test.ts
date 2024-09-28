import * as ansi from "../src/ansi";
import { Style } from "../src/style";

describe("Style", () => {
  it("is empty", () => {
    const style = new Style();
    expect(style.isEmpty()).toBe(true);
    style.bold = true;
    expect(style.isEmpty()).toBe(false);
  });

  it("applies ANSI codes", () => {
    let cases: [ansi.Sequence, Style][] = [
      [{ code: ansi.Code.Reset }, new Style()],
      [{ code: ansi.Code.Bold }, new Style({ bold: true })],
      [{ code: ansi.Code.Italic }, new Style({ italic: true })],
      [{ code: ansi.Code.Underline }, new Style({ underline: true })],
      [{ code: ansi.Code.NotBold }, new Style({ bold: false })],
      [{ code: ansi.Code.NotItalic }, new Style({ italic: false })],
      [{ code: ansi.Code.NotUnderline }, new Style({ underline: false })],
      [{ code: ansi.Code.SetFG8, args: [1] }, new Style({ color: 1 })],
      [{ code: ansi.Code.DefaultFG }, new Style({ color: undefined })],
      [{ code: ansi.Code.SetBG8, args: [1] }, new Style({ background: 1 })],
      [{ code: ansi.Code.DefaultBG }, new Style({ background: undefined })],
      [
        { code: ansi.Code.SetFG24, args: [1, 2, 3] },
        new Style({ color: [1, 2, 3] }),
      ],
      [
        { code: ansi.Code.SetBG24, args: [1, 2, 3] },
        new Style({ background: [1, 2, 3] }),
      ],
    ];

    for (const [seq, expected] of cases) {
      const style = new Style();
      style.applyANSI(seq);
      expect(style).toEqual(expected);
    }
  });

  it("applies ANSI resetters", () => {
    let cases: [ansi.Sequence, Style][] = [
      [
        { code: ansi.Code.Reset },
        new Style({
          bold: true,
          italic: true,
          underline: true,
          color: 1,
          background: 1,
        }),
      ],
      [{ code: ansi.Code.NotBold }, new Style({ bold: true })],
      [{ code: ansi.Code.NotItalic }, new Style({ italic: true })],
      [{ code: ansi.Code.NotUnderline }, new Style({ underline: true })],
      [{ code: ansi.Code.DefaultFG }, new Style({ color: 1 })],
      [{ code: ansi.Code.DefaultBG }, new Style({ background: 1 })],
    ];

    for (const [seq, before] of cases) {
      before.applyANSI(seq);
      expect(before.isEmpty()).toBe(true);
    }
  });
});
