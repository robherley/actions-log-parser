import { useRef } from "react";
import styled from "styled-components";
import { Command } from "../../../src/index";
import type { Element, LinePointer, LogParser, Line } from "../../../src/index";
import { Box, themeGet } from "@primer/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  commandToLineContainerClass,
  commandToLineContentClass,
  stylesToAttributes,
} from "../util/attributes";

const LineContainer = styled.div`
  display: flex;
  line-height: 20px;

  &:hover {
    background-color: ${themeGet("colors.canvas.subtle")} !important;
  }
`;

const LineNumber = styled.span`
  display: inline-block;
  color: ${themeGet("colors.fg.muted")};
  flex-shrink: 0;
  width: 48px;
  text-align: right;
  user-select: none;
`;

const LineContent = styled.span`
  display: inline-block;
  flex: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin-left: 0.5rem;
  overflow-x: auto;
`;

const Prefix: React.FC<{ cmd?: Command }> = ({ cmd }) => {
  switch (cmd) {
    case Command.Error:
      return <span className="text-bold color-fg-danger">{cmd}: </span>;
    case Command.Warning:
      return <span className="text-bold color-fg-attention">{cmd}: </span>;
    case Command.Notice:
      return <span className="text-bold">{cmd}: </span>;
    case Command.Debug:
      // for debug, we actually show the command prefix
      return <span>##[{cmd}]</span>;
    default:
      return null;
  }
};

const RenderedLine: React.FC<{ line?: Line }> = ({ line }) => {
  if (!line) {
    return null;
  }

  const elements = line
    .elements()
    .map((element, i) => <Element key={i} element={element} />);

  return (
    <LineContainer className={commandToLineContainerClass(line.cmd)}>
      <LineNumber>{line.n}</LineNumber>
      <LineContent className={commandToLineContentClass(line.cmd)}>
        <Prefix cmd={line.cmd} />
        {line.parent && "  "}
        {line.group ? (
          <details
            open={line.group.open}
            onClick={(event) => {
              event.preventDefault();
              line.group!.open = !line.group!.open;
            }}
          >
            <summary>{elements}</summary>
          </details>
        ) : (
          elements
        )}
      </LineContent>
    </LineContainer>
  );
};

const Element: React.FC<{ element: Element }> = ({ element }) => {
  if (!element) {
    return null;
  }

  if (typeof element === "string") {
    return <span>{element}</span>;
  }

  if ("href" in element) {
    return (
      <a href={element.href}>
        {element.children.map((child, i) => (
          <Element key={i} element={child} />
        ))}
      </a>
    );
  }

  const { className, style } = stylesToAttributes(element.style);
  return (
    <span className={className} style={style}>
      {element.content}
    </span>
  );
};

const Preview: React.FC<{
  lines: LinePointer[];
  parser: LogParser;
}> = ({ lines, parser }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20,
  });

  return (
    <Box
      ref={parentRef}
      sx={{
        padding: 2,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "border.default",
        borderRadius: 2,
        height: "400px",
        width: "100%",
        overflow: "auto",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <pre
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualItem.start}px)`,
              margin: 0,
            }}
          >
            <RenderedLine line={parser.getVisibleLine(virtualItem.index)} />
          </pre>
        ))}
      </div>
    </Box>
  );
};

export default Preview;
