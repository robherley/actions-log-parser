import { useEffect, useState } from "react";
import { SearchIcon, HourglassIcon } from "@primer/octicons-react";
import {
  Box,
  TextInput,
  Textarea,
  Text,
  themeGet,
  Select,
} from "@primer/react";

import Layout from "./components/Layout";
import Preview from "./components/Preview";
import { LinePointer, LogParser } from "../../src/index";
import examples from "./util/examples";

const parser = new LogParser();

declare global {
  interface Window {
    parser: LogParser;
  }
}
window.parser = parser;

const App = () => {
  const [lines, setLines] = useState<LinePointer[]>([]);
  const [raw, setRaw] = useState<string>("");
  const [perf, setPerf] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);

  useEffect(() => {
    parser.onVisibleLinesChange = (lines) => {
      setLines(lines || []);
    };
  }, [setLines]);

  const stopWatch = (fn: () => void) => {
    const start = performance.now();
    fn();
    setPerf(performance.now() - start);
  };

  const onChange = (value: string) => {
    setRaw(value);
    stopWatch(() => {
      parser.reset();
      parser.addRaw(value);
      setMatches(parser.getMatches());
    });
  };

  return (
    <Layout>
      <Box
        sx={{
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          maxWidth: "80rem",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginBottom: themeGet("space.2"),
          }}
        >
          <Box color="fg.muted" sx={{ display: "flex", alignItems: "center" }}>
            <HourglassIcon size={12} />
            <Text sx={{ marginLeft: themeGet("space.1") }}>{perf} ms</Text>
          </Box>
          <Box>
            <Select
              sx={{ marginRight: themeGet("space.2") }}
              value=""
              onChange={(event) => {
                event.preventDefault();
                let example = "";
                switch (event.target.value) {
                  case "ansi":
                    example = examples.ansi;
                    break;
                }
                onChange(example);
              }}
            >
              <Select.Option value="" disabled>
                Examples
              </Select.Option>
              <Select.Option value="ansi">ANSI Colors</Select.Option>
            </Select>
            <TextInput
              leadingVisual={SearchIcon}
              aria-label="search"
              name="search"
              placeholder="Search"
              autoComplete="off"
              spellCheck="false"
              trailingVisual={matches > 0 && matches}
              onChange={({ target: { value } }) =>
                stopWatch(() => {
                  parser.setSearch(value);
                  setMatches(parser.getMatches());
                })
              }
            />
          </Box>
        </Box>
        <Textarea
          sx={{ marginBottom: themeGet("space.4") }}
          style={{ resize: "none" }}
          rows={10}
          cols={1000}
          spellCheck="false"
          placeholder="##[info]hello world!"
          value={raw}
          onChange={({ target: { value } }) => onChange(value)}
        />

        <Preview lines={lines} parser={parser} />
      </Box>
    </Layout>
  );
};

export default App;
