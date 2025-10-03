import { Header, Text, themeGet } from "@primer/react";
import { CodeIcon } from "@primer/octicons-react";
import { createGlobalStyle } from "styled-components";

export const Style = createGlobalStyle`
  body {
    background-color: ${themeGet("colors.canvas.default")};
  }
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Header>
      <Header.Item>
        <Header.Link
          href="https://github.com/robherley/actions-log-parser"
          sx={{ color: "fg.muted" }}
        >
          <CodeIcon size={16} />
          <Text as="strong" sx={{ marginLeft: themeGet("space.2") }}>
            robherley/actions-log-parser
          </Text>
        </Header.Link>
      </Header.Item>
    </Header>
    {children}
  </>
);

export default Layout;
