# @robherley/actions-log-parser

A TypeScript library for parsing GitHub Actions log streams with ANSI color support, collapsible groups, and text formatting.

## Installation

```bash
npm install @robherley/actions-log-parser
```

## Usage

### Basic Log Parsing

```typescript
import { LogParser } from '@robherley/actions-log-parser';

const parser = new LogParser();

// Add log lines (typically from GitHub Actions log stream)
parser.add('##[group]Building project');
parser.add('npm install');
parser.add('npm run build');
parser.add('##[endgroup]');

// Get parsed lines
const lines = parser.lines;
console.log(lines);
```

### Handling Groups and Commands

```typescript
import { LogParser, Command } from '@robherley/actions-log-parser';

const parser = new LogParser();

// Groups are automatically detected and parsed
parser.add('##[group]Setup Phase');
parser.add('Setting up environment...');
parser.add('##[endgroup]');

// Commands like warnings and errors are parsed
parser.add('##[warning]This is a warning message');
parser.add('##[error]This is an error message');

// Access parsed content
console.log(parser.getVisibleLines()) // [ 0, 1, 2 ]
parser.lines[0].group.open = true
console.log(parser.getVisibleLines()) // [ 0, [ 0, 0 ], 1, 2 ]
```

### Working with ANSI Colors

```typescript
import { LogParser, Styles } from '@robherley/actions-log-parser';

const parser = new LogParser();
const styles = new Styles();

// Parse a line with ANSI escape codes
parser.add('\x1b[32mSuccess!\x1b[0m Build completed');

const line = parser.lines[0];
console.log(line.ansis) // Map(2) { 0 => [ { code: 7, args: [Array] } ], 8 => [ { code: 0 } ] }
```

### Search

```typescript
const parser = new LogParser();

// Add some log content
parser.add('Building application...');
parser.add('Running tests...');
parser.add('Build complete!');

// Set search term
const matches = parser.setSearch('build');
console.log(matches) // 2
```

## Demo

See [https://logs.reb.gg](https://logs.reb.gg) for an interactive demo.

## License

MIT