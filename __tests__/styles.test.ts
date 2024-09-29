import { ANSISequence, ANSICode } from "../src/ansi";
import { Styles } from "../src/styles";

describe("Style", () => {
  it("is empty", () => {
    const style = new Styles();
    expect(style.isEmpty()).toBe(true);
    style.bold = true;
    expect(style.isEmpty()).toBe(false);
  });

  it("applies ANSI codes", () => {
    let cases: [ANSISequence, Styles][] = [
      [{ code: ANSICode.Reset }, new Styles()],
      [{ code: ANSICode.Bold }, new Styles({ bold: true })],
      [{ code: ANSICode.Italic }, new Styles({ italic: true })],
      [{ code: ANSICode.Underline }, new Styles({ underline: true })],
      [{ code: ANSICode.NotBold }, new Styles({ bold: false })],
      [{ code: ANSICode.NotItalic }, new Styles({ italic: false })],
      [{ code: ANSICode.NotUnderline }, new Styles({ underline: false })],
      [{ code: ANSICode.SetFG8, args: [1] }, new Styles({ color: 1 })],
      [{ code: ANSICode.DefaultFG }, new Styles({ color: undefined })],
      [{ code: ANSICode.SetBG8, args: [1] }, new Styles({ background: 1 })],
      [{ code: ANSICode.DefaultBG }, new Styles({ background: undefined })],
      [
        { code: ANSICode.SetFG24, args: [1, 2, 3] },
        new Styles({ color: [1, 2, 3] }),
      ],
      [
        { code: ANSICode.SetBG24, args: [1, 2, 3] },
        new Styles({ background: [1, 2, 3] }),
      ],
    ];

    for (const [seq, expected] of cases) {
      const style = new Styles();
      style.applyANSI(seq);
      expect(style).toEqual(expected);
    }
  });

  it("applies ANSI resetters", () => {
    let cases: [ANSISequence, Styles][] = [
      [
        { code: ANSICode.Reset },
        new Styles({
          bold: true,
          italic: true,
          underline: true,
          color: 1,
          background: 1,
        }),
      ],
      [{ code: ANSICode.NotBold }, new Styles({ bold: true })],
      [{ code: ANSICode.NotItalic }, new Styles({ italic: true })],
      [{ code: ANSICode.NotUnderline }, new Styles({ underline: true })],
      [{ code: ANSICode.DefaultFG }, new Styles({ color: 1 })],
      [{ code: ANSICode.DefaultBG }, new Styles({ background: 1 })],
    ];

    for (const [seq, before] of cases) {
      before.applyANSI(seq);
      expect(before.isEmpty()).toBe(true);
    }
  });
});
