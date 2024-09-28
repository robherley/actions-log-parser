import * as ansi from "../src/ansi";

describe("extract", () => {
  it("reset", () => {
    const [sequences, scrubbed] = ansi.extract("\u{1b}[0mreset\u{1b}[0m");
    expect(scrubbed).toBe("reset");
    expect(sequences).toEqual(
      new Map([
        [0, [{ code: ansi.Code.Reset }]],
        [5, [{ code: ansi.Code.Reset }]],
      ])
    );
  });

  it("bold", () => {
    const [sequences, scrubbed] = ansi.extract("\u{1b}[1mbold\u{1b}[22m");
    expect(scrubbed).toBe("bold");
    expect(sequences).toEqual(
      new Map([
        [0, [{ code: ansi.Code.Bold }]],
        [4, [{ code: ansi.Code.NotBold }]],
      ])
    );
  });

  it("italic", () => {
    const [sequences, scrubbed] = ansi.extract("\u{1b}[3mitalic\u{1b}[23m");
    expect(scrubbed).toBe("italic");
    expect(sequences).toEqual(
      new Map([
        [0, [{ code: ansi.Code.Italic }]],
        [6, [{ code: ansi.Code.NotItalic }]],
      ])
    );
  });

  it("underline", () => {
    const [sequences, scrubbed] = ansi.extract("\u{1b}[4munderline\u{1b}[24m");
    expect(scrubbed).toBe("underline");
    expect(sequences).toEqual(
      new Map([
        [0, [{ code: ansi.Code.Underline }]],
        [9, [{ code: ansi.Code.NotUnderline }]],
      ])
    );
  });

  it("color 4bit fg", () => {
    const [sequences, scrubbed] = ansi.extract(
      "\u{1b}[30m\u{1b}[31m\u{1b}[32m\u{1b}[33m\u{1b}[34m\u{1b}[35m\u{1b}[36m\u{1b}[37m4bit-colors\u{1b}[39m"
    );
    expect(scrubbed).toBe("4bit-colors");
    expect(sequences).toEqual(
      new Map([
        [
          0,
          [
            { code: ansi.Code.SetFG8, args: [0] },
            { code: ansi.Code.SetFG8, args: [1] },
            { code: ansi.Code.SetFG8, args: [2] },
            { code: ansi.Code.SetFG8, args: [3] },
            { code: ansi.Code.SetFG8, args: [4] },
            { code: ansi.Code.SetFG8, args: [5] },
            { code: ansi.Code.SetFG8, args: [6] },
            { code: ansi.Code.SetFG8, args: [7] },
          ],
        ],
        [11, [{ code: ansi.Code.DefaultFG }]],
      ])
    );
  });

  it("color 4bit bg", () => {
    const [sequences, scrubbed] = ansi.extract(
      "\u{1b}[40m\u{1b}[41m\u{1b}[42m\u{1b}[43m\u{1b}[44m\u{1b}[45m\u{1b}[46m\u{1b}[47m4bit-colors\u{1b}[49m"
    );
    expect(scrubbed).toBe("4bit-colors");
    expect(sequences).toEqual(
      new Map([
        [
          0,
          [
            { code: ansi.Code.SetBG8, args: [0] },
            { code: ansi.Code.SetBG8, args: [1] },
            { code: ansi.Code.SetBG8, args: [2] },
            { code: ansi.Code.SetBG8, args: [3] },
            { code: ansi.Code.SetBG8, args: [4] },
            { code: ansi.Code.SetBG8, args: [5] },
            { code: ansi.Code.SetBG8, args: [6] },
            { code: ansi.Code.SetBG8, args: [7] },
          ],
        ],
        [11, [{ code: ansi.Code.DefaultBG }]],
      ])
    );
  });

  it("color 4bit hi fg", () => {
    const [sequences, scrubbed] = ansi.extract(
      "\u{1b}[90m\u{1b}[91m\u{1b}[92m\u{1b}[93m\u{1b}[94m\u{1b}[95m\u{1b}[96m\u{1b}[97m4bit-colors high intensity\u{1b}[39m"
    );
    expect(scrubbed).toBe("4bit-colors high intensity");
    expect(sequences).toEqual(
      new Map([
        [
          0,
          [
            { code: ansi.Code.SetFG8, args: [8] },
            { code: ansi.Code.SetFG8, args: [9] },
            { code: ansi.Code.SetFG8, args: [10] },
            { code: ansi.Code.SetFG8, args: [11] },
            { code: ansi.Code.SetFG8, args: [12] },
            { code: ansi.Code.SetFG8, args: [13] },
            { code: ansi.Code.SetFG8, args: [14] },
            { code: ansi.Code.SetFG8, args: [15] },
          ],
        ],
        [26, [{ code: ansi.Code.DefaultFG }]],
      ])
    );
  });

  it("color 4bit hi bg", () => {
    const [sequences, scrubbed] = ansi.extract(
      "\u{1b}[100m\u{1b}[101m\u{1b}[102m\u{1b}[103m\u{1b}[104m\u{1b}[105m\u{1b}[106m\u{1b}[107m4bit-colors high intensity\u{1b}[49m"
    );
    expect(scrubbed).toBe("4bit-colors high intensity");
    expect(sequences).toEqual(
      new Map([
        [
          0,
          [
            { code: ansi.Code.SetBG8, args: [8] },
            { code: ansi.Code.SetBG8, args: [9] },
            { code: ansi.Code.SetBG8, args: [10] },
            { code: ansi.Code.SetBG8, args: [11] },
            { code: ansi.Code.SetBG8, args: [12] },
            { code: ansi.Code.SetBG8, args: [13] },
            { code: ansi.Code.SetBG8, args: [14] },
            { code: ansi.Code.SetBG8, args: [15] },
          ],
        ],
        [26, [{ code: ansi.Code.DefaultBG }]],
      ])
    );
  });

  it("color 8bit fg", () => {
    const [sequences, scrubbed] = ansi.extract(
      "\u{1b}[38;5;111m8-bit\u{1b}[0m"
    );
    expect(scrubbed).toBe("8-bit");
    expect(sequences).toEqual(
      new Map([
        [0, [{ code: ansi.Code.SetFG8, args: [111] }]],
        [5, [{ code: ansi.Code.Reset }]],
      ])
    );
  });

  it("color 8bit bg", () => {
    const [sequences, scrubbed] = ansi.extract(
      "\u{1b}[48;5;111m8-bit\u{1b}[0m"
    );
    expect(scrubbed).toBe("8-bit");
    expect(sequences).toEqual(
      new Map([
        [0, [{ code: ansi.Code.SetBG8, args: [111] }]],
        [5, [{ code: ansi.Code.Reset }]],
      ])
    );
  });

  it("color 8bit invalid", () => {
    let invalid = "\u{1b}[38;5;256m\u{1b}[48;5;256minvalid";
    const [sequences, scrubbed] = ansi.extract(invalid);
    expect(scrubbed).toBe(invalid);
    expect(sequences.size).toBe(0);
  });

  it("color 24bit fg", () => {
    const [sequences, scrubbed] = ansi.extract(
      "\u{1b}[38;2;100;110;111m24-bit\u{1b}[0m"
    );
    expect(scrubbed).toBe("24-bit");
    expect(sequences).toEqual(
      new Map([
        [0, [{ code: ansi.Code.SetFG24, args: [100, 110, 111] }]],
        [6, [{ code: ansi.Code.Reset }]],
      ])
    );
  });

  it("color 24bit bg", () => {
    const [sequences, scrubbed] = ansi.extract(
      "\u{1b}[48;2;100;110;111m24-bit\u{1b}[0m"
    );
    expect(scrubbed).toBe("24-bit");
    expect(sequences).toEqual(
      new Map([
        [0, [{ code: ansi.Code.SetBG24, args: [100, 110, 111] }]],
        [6, [{ code: ansi.Code.Reset }]],
      ])
    );
  });

  it("color 24bit invalid", () => {
    const invalid = "\u{1b}[38;2;256;100;100m\u{1b}[48;2;256;100;100minvalid";
    const [sequences, scrubbed] = ansi.extract(invalid);
    expect(scrubbed).toBe(invalid);
    expect(sequences.size).toBe(0);
  });

  it("invalid junk", () => {
    const invalid =
      "\u{1b}[1337minvalid\u{1b}[1337;1337;1337;1337mwithout an m:\u{1b}[0";
    const [sequences, scrubbed] = ansi.extract(invalid);
    expect(scrubbed).toBe(invalid);
    expect(sequences.size).toBe(0);
  });

  it("multi sequence", () => {
    const [sequences, scrubbed] = ansi.extract(
      "\u{1b}[36;1mbold cyan\u{1b}[0m"
    );
    expect(scrubbed).toBe("bold cyan");
    expect(sequences).toEqual(
      new Map([
        [0, [{ code: ansi.Code.SetFG8, args: [6] }, { code: ansi.Code.Bold }]],
        [9, [{ code: ansi.Code.Reset }]],
      ])
    );
  });
});
