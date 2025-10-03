/**
 * ANSI escape code types supported by the parser
 */
export enum ANSICode {
  Reset,
  Bold,
  Italic,
  Underline,
  NotBold,
  NotItalic,
  NotUnderline,
  SetFG8,
  DefaultFG,
  SetBG8,
  DefaultBG,
  SetFG24,
  SetBG24,
}

/**
 * Map of character positions to ANSI sequences found at those positions
 */
export type ANSISequenceMap = Map<number, ANSISequence[]>;

/**
 * Represents a single ANSI escape sequence with its code and optional arguments
 */
export interface ANSISequence {
  code: ANSICode;
  args?: [number] | [number, number, number];
}

/**
 * Extracts ANSI escape sequences from a string and returns both the sequence map and clean text
 * @param str - The input string containing potential ANSI escape sequences
 * @returns A tuple containing the sequence map (position -> sequences) and the cleaned string
 */
export function extractANSI(str: string): [ANSISequenceMap, string] {
  let scrubbed = "";
  let sequences = new Map<number, ANSISequence[]>();

  for (let i = 0; i < str.length; i++) {
    if (str[i] == "\x1b" && str[i + 1] == "[") {
      let sub = str.slice(i + 1);
      let end = sub.indexOf("m");
      if (end === -1) {
        // invalid, no end to the sequence
        scrubbed += str[i];
        continue;
      }

      let possibleSequences = sub.slice(1, end).split(";").map(Number);
      if (
        possibleSequences.length === 0 ||
        possibleSequences.includes(NaN) ||
        possibleSequences.some((n) => n < 0 || n > 255)
      ) {
        // invalid, must be numbers and between 0 and 255
        scrubbed += str[i];
        continue;
      }
      let matched = matchSequences(possibleSequences);
      if (matched.length === 0) {
        // invalid, no matches
        scrubbed += str[i];
        continue;
      }

      // valid, add to sequences at the length of the scrubbed result
      let idx = scrubbed.length;
      if (!sequences.has(idx)) {
        sequences.set(idx, matched);
      } else {
        sequences.set(idx, sequences.get(idx)!.concat(matched));
      }
      // move iterator to end of matched sequence
      i += end + 1;
    } else {
      scrubbed += str[i];
    }
  }

  return [sequences, scrubbed];
}

function matchSequences(codes: number[]): ANSISequence[] {
  let s: ANSISequence[] = [];

  while (codes.length) {
    let code = codes.shift()!;
    switch (code) {
      case 0:
        s.push({ code: ANSICode.Reset });
        break;
      case 1:
        s.push({ code: ANSICode.Bold });
        break;
      case 3:
        s.push({ code: ANSICode.Italic });
        break;
      case 4:
        s.push({ code: ANSICode.Underline });
        break;
      case 22:
        s.push({ code: ANSICode.NotBold });
        break;
      case 23:
        s.push({ code: ANSICode.NotItalic });
        break;
      case 24:
        s.push({ code: ANSICode.NotUnderline });
        break;
      case 30:
      case 31:
      case 32:
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
        // https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
        s.push({ code: ANSICode.SetFG8, args: [code - 30] }); // 30-37 are 4bit colors
        break;
      case 38: {
        let next = codes.shift();
        switch (next) {
          // 8-bit color FG
          case 5: {
            if (codes.length < 1) return [];
            s.push({ code: ANSICode.SetFG8, args: [codes.shift()!] });
            break;
          }
          // 24-bit color FG
          case 2: {
            if (codes.length < 3) return [];
            s.push({
              code: ANSICode.SetFG24,
              args: [codes.shift()!, codes.shift()!, codes.shift()!],
            });
            break;
          }
          default:
            return [];
        }
        break;
      }
      case 39:
        s.push({ code: ANSICode.DefaultFG });
        break;
      case 40:
      case 41:
      case 42:
      case 43:
      case 44:
      case 45:
      case 46:
      case 47:
        // 40-47 are 4bit colors
        s.push({ code: ANSICode.SetBG8, args: [code - 40] });
        break;
      case 48: {
        let next = codes.shift();
        switch (next) {
          // 8-bit color BG
          case 5: {
            if (codes.length < 1) return [];
            s.push({ code: ANSICode.SetBG8, args: [codes.shift()!] });
            break;
          }
          // 24-bit color BG
          case 2: {
            if (codes.length < 3) return [];
            s.push({
              code: ANSICode.SetBG24,
              args: [codes.shift()!, codes.shift()!, codes.shift()!],
            });
            break;
          }
          default:
            return [];
        }
        break;
      }
      case 49:
        s.push({ code: ANSICode.DefaultBG });
        break;
      case 90:
      case 91:
      case 92:
      case 93:
      case 94:
      case 95:
      case 96:
      case 97:
        // bright 4bit colors FG
        s.push({ code: ANSICode.SetFG8, args: [code - 90 + 8] });
        break;
      case 100:
      case 101:
      case 102:
      case 103:
      case 104:
      case 105:
      case 106:
      case 107:
        // bright 4bit colors BG
        s.push({ code: ANSICode.SetBG8, args: [code - 100 + 8] });
        break;
      default:
        // invalid
        return [];
    }
  }

  return s;
}
