import { parse } from "acorn";
import { fullAncestor, simple } from "acorn-walk";
import MagicString from "magic-string";

type LocatedNode = { type: string; start: number; end: number; loc?: { start: { line: number } }; [key: string]: unknown };
function node(value: unknown): LocatedNode { return value as LocatedNode; }
function identifier(value: unknown): string | null {
  const item = node(value);
  return item?.type === "Identifier" && typeof item.name === "string" ? item.name : null;
}

export function instrumentJavaScript(source: string): string {
  const tree = parse(source, { ecmaVersion: "latest", sourceType: "script", locations: true });
  const names = new Set<string>();
  simple(tree, {
    VariableDeclarator(value) { const name = identifier(node(value).id); if (name) names.add(name); },
    FunctionDeclaration(value) {
      for (const param of (node(value).params as unknown[] | undefined) ?? []) { const name = identifier(param); if (name) names.add(name); }
    },
    AssignmentExpression(value) { const name = identifier(node(value).left); if (name) names.add(name); },
  });
  const snapshot = () => `{${[...names].slice(0, 24).map((name) => `${JSON.stringify(name)}:(()=>{try{return ${name}}catch{return undefined}})()`).join(",")}}`;
  const edited = new MagicString(source);
  fullAncestor(tree, (raw, _state, ancestors) => {
    const item = node(raw);
    const parent = node(ancestors.at(-2));
    const line = item.loc?.start.line ?? 1;
    if ((item.type === "VariableDeclaration" || item.type === "ExpressionStatement") &&
        !["ForStatement", "WhileStatement", "DoWhileStatement", "IfStatement", "LabeledStatement"].includes(parent?.type ?? "")) {
      edited.appendRight(item.end, `;__tcTrace(${line},"variables",${snapshot()});`);
    }
    if (item.type === "IfStatement" || item.type === "WhileStatement" || item.type === "ForStatement") {
      const test = item.test ? node(item.test) : null;
      if (test) {
        edited.appendLeft(test.start, "__tcCondition((");
        edited.appendRight(test.end, `),${line},${snapshot()})`);
      }
      const body = item.body ? node(item.body) : null;
      if ((item.type === "WhileStatement" || item.type === "ForStatement") && body?.type === "BlockStatement") {
        edited.appendRight(body.start + 1, `__tcTrace(${line},"iteration",${snapshot()});`);
      }
    }
    if (item.type === "FunctionDeclaration") {
      const body = node(item.body);
      if (body.type === "BlockStatement") edited.appendRight(body.start + 1, `__tcTrace(${line},"function_call",${snapshot()},undefined,undefined,${JSON.stringify(identifier(item.id) ?? "function")});`);
    }
    if (item.type === "ReturnStatement" && item.argument) {
      const argument = node(item.argument);
      edited.appendLeft(argument.start, "__tcReturn((");
      edited.appendRight(argument.end, `),${line},${snapshot()})`);
    }
    if (item.type === "MemberExpression" && item.computed && identifier(item.object) &&
        (identifier(item.property) || node(item.property).type === "Literal") &&
        !(parent?.type === "AssignmentExpression" && parent.left === raw) &&
        !(parent?.type === "UpdateExpression" && parent.argument === raw) &&
        !(parent?.type === "CallExpression" && parent.callee === raw)) {
      const property = node(item.property);
      const index = identifier(property) ?? JSON.stringify(property.value);
      edited.appendLeft(item.start, "__tcArrayAccess((");
      edited.appendRight(item.end, `),${JSON.stringify(identifier(item.object))},${index},${line},${snapshot()})`);
    }
  });
  return edited.toString();
}
