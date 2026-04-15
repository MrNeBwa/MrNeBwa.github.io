import { MarkerType, Position } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid'; // need to install uuid

export type ParsedFunctionFlowchart = {
  functionName: string;
  nodes: Node[];
  edges: Edge[];
};

type Statement =
  | { kind: 'action'; text: string }
  | { kind: 'if'; condition: string; thenBranch: Statement[]; elseBranch: Statement[] }
  | { kind: 'loop'; condition: string; body: Statement[] }
  | { kind: 'switch'; expression: string; cases: Array<{ label: string; body: Statement[] }>; defaultBody: Statement[] };

type FlowFragment = {
  entry: string | null;
  exits: ExitRef[];
};

type ExitRef = {
  nodeId: string;
  sourceHandle?: string;
  label?: string;
};

const CONTROL_KEYWORDS = ['if', 'for', 'while', 'switch', 'catch', 'else'];

function stripLineComments(line: string): string {
  return line.replace(/\/\/.*$/g, '');
}

function countChar(input: string, charToCount: string): number {
  return (input.match(new RegExp(`\\${charToCount}`, 'g')) || []).length;
}

function normalizeLine(line: string): string {
  return stripLineComments(line).trim();
}

function combineMultilineStreamStatements(lines: string[]): string[] {
  const combined: string[] = [];
  let current = '';

  const startsWithStreamContinuation = (line: string) => /^(<<|>>)\s*/.test(line);
  const endsWithStreamContinuation = (line: string) => /(<<|>>)\s*$/.test(line);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (!current) {
      current = line;
      continue;
    }

    if (startsWithStreamContinuation(line) || endsWithStreamContinuation(current)) {
      current = `${current} ${line}`.trim();
      continue;
    }

    combined.push(current);
    current = line;
  }

  if (current) {
    combined.push(current);
  }

  return combined;
}

function splitToTokens(lines: string[]): string[] {
  const tokens: string[] = [];
  const logicalLines = combineMultilineStreamStatements(lines);

  for (const line of logicalLines) {
    if (!line) continue;

    let current = '';
    for (const char of line) {
      if (char === '{' || char === '}') {
        const trimmed = current.trim();
        if (trimmed) tokens.push(trimmed);
        tokens.push(char);
        current = '';
      } else {
        current += char;
      }
    }

    const tail = current.trim();
    if (tail) tokens.push(tail);
  }

  return tokens;
}

function isIfToken(token: string): boolean {
  return /^if\s*\(/.test(token);
}

function isElseIfToken(token: string): boolean {
  return /^else\s+if\s*\(/.test(token);
}

function isLoopToken(token: string): boolean {
  return /^for\s*\(/.test(token) || /^while\s*\(/.test(token);
}

function isSwitchToken(token: string): boolean {
  return /^switch\s*\(/.test(token);
}

function isCaseToken(token: string): boolean {
  return /^case\s+.*:/.test(token);
}

function isDefaultToken(token: string): boolean {
  return /^default\s*:/.test(token);
}

function isTypeDeclarationToken(token: string): boolean {
  return /^(class|struct|enum)\b/.test(token.trim());
}

function isAccessSpecifierToken(token: string): boolean {
  return /^(public|private|protected)\s*:\s*$/.test(token.trim());
}

function formatDeclarationLabel(token: string): string {
  const cleaned = token.replace(/\s+/g, ' ').trim();
  const enumMatch = cleaned.match(/^enum\s+(class\s+)?([\w:]+)/);
  if (enumMatch) {
    const enumName = enumMatch[2] || 'Enum';
    return `enum ${enumName}`;
  }

  const classMatch = cleaned.match(/^class\s+([\w:]+)/);
  if (classMatch) {
    return `class ${classMatch[1]}`;
  }

  const structMatch = cleaned.match(/^struct\s+([\w:]+)/);
  if (structMatch) {
    return `struct ${structMatch[1]}`;
  }

  return cleaned;
}

function isInitializerAssignmentToken(token: string): boolean {
  const cleaned = token.replace(/\s+/g, ' ').trim();
  return /[\w\]\)>:]\s*=\s*$/.test(cleaned);
}

function formatInitializerAssignmentLabel(token: string): string {
  const cleaned = token.replace(/\s+/g, ' ').trim();
  return `${cleaned} { ... }`;
}

function parseStatements(tokens: string[]): Statement[] {
  let index = 0;

  const parseSingleOrBlock = (): Statement[] => {
    if (index >= tokens.length) return [];
    if (tokens[index] === '{') {
      index += 1;
      return parseBlock(true);
    }
    const statement = parseOne();
    return statement ? [statement] : [];
  };

  const parseSwitchBody = () => {
    const cases: Array<{ label: string; body: Statement[] }> = [];
    let defaultBody: Statement[] = [];

    const parseInlineStatements = (inline: string): Statement[] => {
      const cleaned = inline.trim();
      if (!cleaned) return [];
      const inlineTokens = splitToTokens([cleaned]);
      return parseStatements(inlineTokens);
    };

    const extractCaseLabelAndTail = (token: string): { label: string; tail: string } => {
      const match = token.match(/^case\s+(.+):\s*(.*)$/);
      if (!match) {
        return { label: token.replace(/^case\s+/, '').trim(), tail: '' };
      }
      return {
        label: (match[1] || '').trim(),
        tail: (match[2] || '').trim(),
      };
    };

    const extractDefaultTail = (token: string): string => {
      const match = token.match(/^default\s*:\s*(.*)$/);
      return (match?.[1] || '').trim();
    };

    if (tokens[index] === '{') {
      index += 1;
    }

    while (index < tokens.length && tokens[index] !== '}') {
      const token = tokens[index];

      if (isCaseToken(token)) {
        const { label, tail } = extractCaseLabelAndTail(token);
        index += 1;
        const body: Statement[] = [...parseInlineStatements(tail)];

        while (
          index < tokens.length
          && tokens[index] !== '}'
          && !isCaseToken(tokens[index])
          && !isDefaultToken(tokens[index])
        ) {
          const stmt = parseOne();
          if (stmt) body.push(stmt);
        }

        cases.push({ label, body });
        continue;
      }

      if (isDefaultToken(token)) {
        const tail = extractDefaultTail(token);
        index += 1;
        const body: Statement[] = [...parseInlineStatements(tail)];
        while (
          index < tokens.length
          && tokens[index] !== '}'
          && !isCaseToken(tokens[index])
        ) {
          const stmt = parseOne();
          if (stmt) body.push(stmt);
        }
        defaultBody = body;
        continue;
      }

      index += 1;
    }

    if (tokens[index] === '}') {
      index += 1;
    }

    return { cases, defaultBody };
  };

  const parseOne = (): Statement | null => {
    if (index >= tokens.length) return null;

    const token = tokens[index];

    if (!token) {
      index += 1;
      return null;
    }

    if (token === '{') {
      index += 1;
      const nested = parseBlock(true);
      return nested[0] || null;
    }

    if (token === '}') {
      return null;
    }

    if (isAccessSpecifierToken(token) || token === ':' || token === ',') {
      index += 1;
      return null;
    }

    if (isTypeDeclarationToken(token)) {
      const declarationLabel = formatDeclarationLabel(token);
      index += 1;

      if (tokens[index] === '{') {
        index += 1;
        let depth = 1;
        while (index < tokens.length && depth > 0) {
          if (tokens[index] === '{') depth += 1;
          else if (tokens[index] === '}') depth -= 1;
          index += 1;
        }

        if (tokens[index] === ';') {
          index += 1;
        }
      }

      return { kind: 'action', text: declarationLabel };
    }

    if (isInitializerAssignmentToken(token) && tokens[index + 1] === '{') {
      const label = formatInitializerAssignmentLabel(token);
      index += 2;
      let depth = 1;

      while (index < tokens.length && depth > 0) {
        if (tokens[index] === '{') depth += 1;
        else if (tokens[index] === '}') depth -= 1;
        index += 1;
      }

      if (tokens[index] === ';') {
        index += 1;
      }

      return { kind: 'action', text: label };
    }

    if (isIfToken(token)) {
      const condition = token;
      index += 1;
      const thenBranch = parseSingleOrBlock();

      let elseBranch: Statement[] = [];
      const elseToken = tokens[index] || '';
      if (elseToken === 'else' || isElseIfToken(elseToken)) {
        if (isElseIfToken(elseToken)) {
          tokens[index] = elseToken.replace(/^else\s+/, '');
        } else {
          index += 1;
        }

        if (isIfToken(tokens[index] || '')) {
          const nestedIf = parseOne();
          elseBranch = nestedIf ? [nestedIf] : [];
        } else {
          elseBranch = parseSingleOrBlock();
        }
      }

      return { kind: 'if', condition, thenBranch, elseBranch };
    }

    if (isLoopToken(token)) {
      const condition = token;
      index += 1;
      const body = parseSingleOrBlock();
      return { kind: 'loop', condition, body };
    }

    if (isSwitchToken(token)) {
      const expression = token;
      index += 1;
      const { cases, defaultBody } = parseSwitchBody();
      return { kind: 'switch', expression, cases, defaultBody };
    }

    if (token === 'else') {
      index += 1;
      return null;
    }

    const cleanedAction = token.replace(/\s+/g, ' ').trim();
    index += 1;

    if (!cleanedAction || /^[,:;]+$/.test(cleanedAction)) {
      return null;
    }

    if (/^".*"\s*,?\s*$/.test(cleanedAction) || /^[\w:]+\s*,\s*$/.test(cleanedAction)) {
      return null;
    }

    return { kind: 'action', text: cleanedAction };
  };

  const parseBlock = (stopOnRightBrace: boolean): Statement[] => {
    const list: Statement[] = [];

    while (index < tokens.length) {
      if (stopOnRightBrace && tokens[index] === '}') {
        index += 1;
        break;
      }

      if (tokens[index] === '{') {
        index += 1;
        const nested = parseBlock(true);
        list.push(...nested);
        continue;
      }

      const statement = parseOne();
      if (statement) {
        list.push(statement);
      } else if (!stopOnRightBrace && tokens[index] === '}') {
        break;
      } else if (statement === null && tokens[index] === '}') {
        if (stopOnRightBrace) {
          index += 1;
        }
        break;
      }
    }

    return list;
  };

  return parseBlock(false);
}

function isFunctionHeader(header: string): boolean {
  if (!header.includes('(') || !header.includes(')')) return false;
  if (header.endsWith(';')) return false;

  const cleaned = header.replace(/\s+/g, ' ').trim();

  if (/^(namespace|class|struct|enum|union|if|for|while|switch|catch)\b/.test(cleaned)) {
    return false;
  }

  const patterns = [
    /^(?:(?:inline|static|virtual|explicit|constexpr|friend)\s+)*(?:[\w:<>]+\s+)*[\w:*&<>]+\s+([\w:~]+)\s*\([^)]*\)\s*(?:const)?\s*(?:noexcept(?:\([^)]*\))?)?\s*(?:override|final)?\s*(?:->\s*[^\s]+)?\s*$/,
    /^([\w:~]+)\s*\([^)]*\)\s*(?:const)?\s*(?:noexcept(?:\([^)]*\))?)?\s*(?:override|final)?\s*$/,
  ];

  let match: RegExpMatchArray | null = null;
  for (const pattern of patterns) {
    match = cleaned.match(pattern);
    if (match) break;
  }

  if (!match) return false;

  const fullName = match[1] || '';
  const name = fullName.split('::').pop() || fullName;

  if (name.startsWith('~') || CONTROL_KEYWORDS.includes(name)) {
    return false;
  }

  return true;
}

function extractFunctionName(header: string): string {
  const cleaned = header.replace(/\s+/g, ' ').trim();

  const patterns = [
    /^([\w:~]+)\s*\(/,
    /^(?:(?:inline|static|virtual|explicit|constexpr|friend)\s+)*(?:[\w:<>]+\s+)*[\w:*&<>]+\s+([\w:~]+)\s*\(/,
    /(?:[\w:*&<>]+\s+)*([\w:~]+)\s*\(/,
    /([\w:~]+)\s*\(/,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      let funcName = match[1].split('::').pop() || match[1];
      funcName = funcName.replace(/^~/, '') || 'function';
      return funcName;
    }
  }

  return 'function';
}

function buildFlowchartForFunction(functionName: string, bodyLines: string[], colors: Record<string, string>): ParsedFunctionFlowchart {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let yOffset = 60;
  const xCenter = 420;
  const laneWidth = 280;

  const addEdgeWithStyle = (params: {
    source: string;
    target: string;
    sourceHandle?: string;
    label?: string;
  }) => {
    const { source, target, sourceHandle, label } = params;
    edges.push({
      id: `e-${source}-${target}-${uuidv4()}`,
      source,
      target,
      sourceHandle,
      label,
      type: 'smoothstep',
      style: { stroke: '#334155', strokeWidth: 1.6 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#334155',
      },
      labelStyle: { fill: '#0f172a', fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.92 },
      labelBgPadding: [6, 2],
      labelBgBorderRadius: 4,
    });
  };

  const addNode = (type: string, label: string, lane = 0) => {
    const id = uuidv4();
    const node: Node = {
      id,
      type,
      position: { x: xCenter + lane * laneWidth, y: yOffset },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      data: { label, color: colors[type] || '#ffffff' },
    };
    nodes.push(node);
    yOffset += 150;
    return id;
  };

  const classifyActionNodeType = (text: string): string => {
    if (text.includes('cin >>') || text.includes('cout <<') || text.includes('scanf(') || text.includes('printf(')) {
      return 'io';
    }
    return 'process';
  };

  const connectExits = (exitRefs: ExitRef[], targetId: string) => {
    exitRefs.forEach((exit) => {
      addEdgeWithStyle({
        source: exit.nodeId,
        target: targetId,
        sourceHandle: exit.sourceHandle,
        label: exit.label,
      });
    });
  };

  const buildSequence = (statements: Statement[], lane = 0): FlowFragment => {
    let entry: string | null = null;
    let pendingExits: ExitRef[] = [];

    for (const statement of statements) {
      const fragment = buildStatement(statement, lane);
      if (!fragment.entry) continue;

      if (!entry) {
        entry = fragment.entry;
      }

      if (pendingExits.length) {
        connectExits(pendingExits, fragment.entry);
      }

      pendingExits = fragment.exits;
    }

    return { entry, exits: pendingExits };
  };

  const buildSwitch = (statement: Extract<Statement, { kind: 'switch' }>, lane: number): FlowFragment => {
    if (!statement.cases.length && !statement.defaultBody.length) {
      const id = addNode('process', statement.expression, lane);
      return { entry: id, exits: [{ nodeId: id }] };
    }

    let entry: string | null = null;
    let noMatchRefs: ExitRef[] = [];
    const exits: ExitRef[] = [];

    statement.cases.forEach((switchCase, caseIndex) => {
      const decisionId = addNode('decision', `${statement.expression} == ${switchCase.label}`, lane);
      if (!entry) {
        entry = decisionId;
      }

      if (caseIndex === 0) {
        noMatchRefs = [{ nodeId: decisionId, sourceHandle: 'left', label: 'Нет' }];
      } else {
        connectExits(noMatchRefs, decisionId);
        noMatchRefs = [{ nodeId: decisionId, sourceHandle: 'left', label: 'Нет' }];
      }

      const caseFlow = buildSequence(switchCase.body, lane + 1);
      if (caseFlow.entry) {
        addEdgeWithStyle({ source: decisionId, target: caseFlow.entry, sourceHandle: 'right', label: 'Да' });
        exits.push(...caseFlow.exits);
      } else {
        exits.push({ nodeId: decisionId, sourceHandle: 'right', label: 'Да' });
      }
    });

    if (statement.defaultBody.length) {
      const defaultFlow = buildSequence(statement.defaultBody, lane - 1);
      if (defaultFlow.entry) {
        noMatchRefs.forEach((exitRef) => {
          addEdgeWithStyle({
            source: exitRef.nodeId,
            target: defaultFlow.entry!,
            sourceHandle: exitRef.sourceHandle,
            label: 'default',
          });
        });
        exits.push(...defaultFlow.exits);
      } else {
        exits.push(...noMatchRefs);
      }
    } else {
      exits.push(...noMatchRefs);
    }

    return { entry, exits };
  };

  const buildStatement = (statement: Statement, lane = 0): FlowFragment => {
    if (statement.kind === 'action') {
      const actionType = classifyActionNodeType(statement.text);
      const id = addNode(actionType, statement.text, lane);
      return { entry: id, exits: [{ nodeId: id }] };
    }

    if (statement.kind === 'if') {
      const decisionId = addNode('decision', statement.condition, lane);
      const thenFlow = buildSequence(statement.thenBranch, lane + 1);
      const elseFlow = buildSequence(statement.elseBranch, lane - 1);

      const exits: ExitRef[] = [];

      if (thenFlow.entry) {
        addEdgeWithStyle({ source: decisionId, target: thenFlow.entry, sourceHandle: 'right', label: 'Да' });
        exits.push(...thenFlow.exits);
      } else {
        exits.push({ nodeId: decisionId, sourceHandle: 'right', label: 'Да' });
      }

      if (elseFlow.entry) {
        addEdgeWithStyle({ source: decisionId, target: elseFlow.entry, sourceHandle: 'left', label: 'Нет' });
        exits.push(...elseFlow.exits);
      } else {
        exits.push({ nodeId: decisionId, sourceHandle: 'left', label: 'Нет' });
      }

      return { entry: decisionId, exits };
    }

    if (statement.kind === 'loop') {
      const decisionId = addNode('decision', statement.condition, lane);
      const bodyFlow = buildSequence(statement.body, lane + 1);

      if (bodyFlow.entry) {
        addEdgeWithStyle({ source: decisionId, target: bodyFlow.entry, sourceHandle: 'right', label: 'Да' });
        bodyFlow.exits.forEach((exitRef) => {
          addEdgeWithStyle({
            source: exitRef.nodeId,
            target: decisionId,
            sourceHandle: exitRef.sourceHandle,
            label: 'повтор',
          });
        });
      }

      return {
        entry: decisionId,
        exits: [{ nodeId: decisionId, sourceHandle: 'left', label: 'Нет' }],
      };
    }

    if (statement.kind === 'switch') {
      return buildSwitch(statement, lane);
    }

    return { entry: null, exits: [] };
  };

  const startId = addNode('terminal', `Начало: ${functionName}`, 0);
  const tokens = splitToTokens(bodyLines);
  const statements = parseStatements(tokens);
  const bodyFlow = buildSequence(statements, 0);
  const endId = addNode('terminal', `Конец: ${functionName}`, 0);

  if (bodyFlow.entry) {
    addEdgeWithStyle({ source: startId, target: bodyFlow.entry });
    connectExits(bodyFlow.exits, endId);
  } else {
    addEdgeWithStyle({ source: startId, target: endId });
  }

  return { functionName, nodes, edges };
}

export function parseCppFileToFunctionFlowcharts(code: string, colors: Record<string, string>): ParsedFunctionFlowchart[] {
  const lines = code.split('\n').map(normalizeLine);
  const result: ParsedFunctionFlowchart[] = [];

  let i = 0;
  while (i < lines.length) {
    if (!lines[i]) {
      i += 1;
      continue;
    }

    let header = '';
    let foundOpeningBrace = false;
    while (i < lines.length) {
      const line = lines[i];
      if (!line) {
        i += 1;
        continue;
      }
      if (line.startsWith('#')) {
        header = '';
        i += 1;
        break;
      }

      header = `${header} ${line}`.trim();
      if (line.includes('{')) {
        foundOpeningBrace = true;
        break;
      }
      if (line.endsWith(';')) {
        break;
      }
      i += 1;
    }

    if (!foundOpeningBrace || !header.includes('{')) {
      i += 1;
      continue;
    }

    const functionHeader = header.split('{')[0].trim();
    if (!isFunctionHeader(functionHeader)) {
      i += 1;
      continue;
    }

    const functionName = extractFunctionName(functionHeader);
    const bodyLines: string[] = [];
    let depth = countChar(lines[i], '{') - countChar(lines[i], '}');
    i += 1;

    while (i < lines.length && depth > 0) {
      const line = lines[i];
      depth += countChar(line, '{') - countChar(line, '}');
      if (line) bodyLines.push(line);
      i += 1;
    }

    result.push(buildFlowchartForFunction(functionName, bodyLines, colors));
  }

  return result;
}
