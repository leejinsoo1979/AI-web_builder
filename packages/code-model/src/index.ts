import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import ts from "typescript";

export type SourceLocation = {
  column: number;
  line: number;
  offset: number;
};

export type SourceRange = {
  end: SourceLocation;
  start: SourceLocation;
};

export type CodeElementAttribute = {
  kind: "boolean" | "expression" | "literal" | "spread";
  name: string;
  value?: string;
};

export type CodeElement = {
  attributes: CodeElementAttribute[];
  childrenCount: number;
  componentName?: string;
  filePath: string;
  id: string;
  kind: "component" | "element" | "fragment";
  name: string;
  range: SourceRange;
  textPreview?: string;
};

export type CodeFileModel = {
  elements: CodeElement[];
  filePath: string;
  imports: string[];
  isRouteLike: boolean;
  sourceText: string;
};

export type ProjectIndex = {
  files: CodeFileModel[];
  framework: "next" | "react" | "unknown";
  generatedAt: string;
  rootPath: string;
  summary: {
    elementCount: number;
    fileCount: number;
    routeFileCount: number;
  };
};

const SOURCE_EXTENSIONS = new Set([".tsx", ".jsx"]);
const IGNORE_DIRS = new Set([".git", ".next", "dist", "build", "node_modules", "coverage"]);

export async function indexProject(rootPath: string): Promise<ProjectIndex> {
  const sourceFiles = await findSourceFiles(rootPath);
  const files = await Promise.all(sourceFiles.map((filePath) => parseCodeFile(rootPath, filePath)));
  const filteredFiles = files.filter((file) => file.elements.length > 0 || file.imports.length > 0);
  const framework = detectFramework(filteredFiles);
  const elementCount = filteredFiles.reduce((total, file) => total + file.elements.length, 0);
  const routeFileCount = filteredFiles.filter((file) => file.isRouteLike).length;

  return {
    files: filteredFiles,
    framework,
    generatedAt: new Date().toISOString(),
    rootPath,
    summary: {
      elementCount,
      fileCount: filteredFiles.length,
      routeFileCount
    }
  };
}

export async function parseCodeFile(rootPath: string, absolutePath: string): Promise<CodeFileModel> {
  const sourceText = await readFile(absolutePath, "utf8");
  const sourceFile = ts.createSourceFile(absolutePath, sourceText, ts.ScriptTarget.Latest, true, getScriptKind(absolutePath));
  const filePath = normalizePath(relative(rootPath, absolutePath));
  const imports: string[] = [];
  const elements: CodeElement[] = [];

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      imports.push(node.moduleSpecifier.text);
    }

    if (ts.isJsxElement(node)) {
      elements.push(readJsxElement(sourceFile, filePath, node));
    } else if (ts.isJsxSelfClosingElement(node)) {
      elements.push(readJsxSelfClosingElement(sourceFile, filePath, node));
    } else if (ts.isJsxFragment(node)) {
      elements.push(readJsxFragment(sourceFile, filePath, node));
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    elements,
    filePath,
    imports,
    isRouteLike: isRouteFile(filePath),
    sourceText
  };
}

async function findSourceFiles(rootPath: string) {
  const files: string[] = [];

  async function walk(directory: string) {
    const entries = await readdir(directory, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const entryPath = join(directory, entry.name);

        if (entry.isDirectory()) {
          if (!IGNORE_DIRS.has(entry.name)) {
            await walk(entryPath);
          }
          return;
        }

        if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) {
          files.push(entryPath);
        }
      })
    );
  }

  const rootStat = await stat(rootPath);
  if (!rootStat.isDirectory()) {
    throw new Error(`Project root is not a directory: ${rootPath}`);
  }

  await walk(rootPath);
  return files.sort();
}

function readJsxElement(sourceFile: ts.SourceFile, filePath: string, node: ts.JsxElement): CodeElement {
  const name = node.openingElement.tagName.getText(sourceFile);

  return {
    attributes: readAttributes(sourceFile, node.openingElement.attributes),
    childrenCount: node.children.length,
    componentName: isComponentName(name) ? name : undefined,
    filePath,
    id: createElementId(filePath, node.getStart(sourceFile), name),
    kind: isComponentName(name) ? "component" : "element",
    name,
    range: readRange(sourceFile, node),
    textPreview: readTextPreview(node.children)
  };
}

function readJsxSelfClosingElement(sourceFile: ts.SourceFile, filePath: string, node: ts.JsxSelfClosingElement): CodeElement {
  const name = node.tagName.getText(sourceFile);

  return {
    attributes: readAttributes(sourceFile, node.attributes),
    childrenCount: 0,
    componentName: isComponentName(name) ? name : undefined,
    filePath,
    id: createElementId(filePath, node.getStart(sourceFile), name),
    kind: isComponentName(name) ? "component" : "element",
    name,
    range: readRange(sourceFile, node)
  };
}

function readJsxFragment(sourceFile: ts.SourceFile, filePath: string, node: ts.JsxFragment): CodeElement {
  return {
    attributes: [],
    childrenCount: node.children.length,
    filePath,
    id: createElementId(filePath, node.getStart(sourceFile), "Fragment"),
    kind: "fragment",
    name: "Fragment",
    range: readRange(sourceFile, node),
    textPreview: readTextPreview(node.children)
  };
}

function readAttributes(sourceFile: ts.SourceFile, attributes: ts.JsxAttributes): CodeElementAttribute[] {
  return attributes.properties.map((attribute) => {
    if (ts.isJsxSpreadAttribute(attribute)) {
      return {
        kind: "spread",
        name: attribute.expression.getText(sourceFile)
      };
    }

    const name = attribute.name.getText(sourceFile);

    if (!attribute.initializer) {
      return { kind: "boolean", name };
    }

    if (ts.isStringLiteral(attribute.initializer)) {
      return {
        kind: "literal",
        name,
        value: attribute.initializer.text
      };
    }

    return {
      kind: "expression",
      name,
      value: attribute.initializer.getText(sourceFile)
    };
  });
}

function readRange(sourceFile: ts.SourceFile, node: ts.Node): SourceRange {
  return {
    end: readLocation(sourceFile, node.getEnd()),
    start: readLocation(sourceFile, node.getStart(sourceFile))
  };
}

function readLocation(sourceFile: ts.SourceFile, offset: number): SourceLocation {
  const position = sourceFile.getLineAndCharacterOfPosition(offset);

  return {
    column: position.character + 1,
    line: position.line + 1,
    offset
  };
}

function readTextPreview(children: ts.NodeArray<ts.JsxChild>) {
  const text = children
    .filter(ts.isJsxText)
    .map((child) => child.getText().replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");

  return text || undefined;
}

function getScriptKind(filePath: string) {
  return extname(filePath) === ".jsx" ? ts.ScriptKind.JSX : ts.ScriptKind.TSX;
}

function createElementId(filePath: string, offset: number, name: string) {
  return createHash("sha1").update(`${filePath}:${offset}:${name}`).digest("hex").slice(0, 12);
}

function normalizePath(path: string) {
  return path.split(sep).join("/");
}

function isComponentName(name: string) {
  return /^[A-Z]/.test(name);
}

function isRouteFile(filePath: string) {
  return /(^|\/)(app|pages)\/.*\.(tsx|jsx)$/.test(filePath) || /(^|\/)(page|layout)\.(tsx|jsx)$/.test(filePath);
}

function detectFramework(files: CodeFileModel[]): ProjectIndex["framework"] {
  if (files.some((file) => file.filePath.startsWith("app/") || file.filePath.startsWith("pages/"))) {
    return "next";
  }

  if (files.some((file) => file.imports.includes("react") || file.filePath.includes("/src/"))) {
    return "react";
  }

  return "unknown";
}
