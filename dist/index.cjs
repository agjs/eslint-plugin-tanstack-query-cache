"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  configs: () => configs,
  default: () => src_default,
  prefixQueryKeyMustUseSetQueriesDataRule: () => prefixQueryKeyMustUseSetQueriesDataRule,
  rules: () => rules
});
module.exports = __toCommonJS(src_exports);

// src/configs/recommended.ts
var recommendedRules = {
  "tanstack-query-cache/prefix-query-key-must-use-set-queries-data": "error"
};

// src/rules/prefix-query-key-must-use-set-queries-data.ts
var import_utils2 = require("@typescript-eslint/utils");

// src/utils/createRule.ts
var import_utils = require("@typescript-eslint/utils");
var createRule = import_utils.ESLintUtils.RuleCreator(
  (ruleName) => `https://github.com/agjs/eslint-plugin-tanstack-query-cache/blob/main/docs/rules/${ruleName}.md`
);

// src/rules/prefix-query-key-must-use-set-queries-data.ts
var HOOK_NAMES = /* @__PURE__ */ new Set([
  "useQuery",
  "useInfiniteQuery",
  "useSuspenseQuery",
  "useSuspenseInfiniteQuery"
]);
var PREFIX_UNSAFE_METHODS = /* @__PURE__ */ new Set([
  "setQueryData",
  "getQueryData",
  "cancelQueries",
  "removeQueries",
  "resetQueries",
  "prefetchQuery"
]);
var METHODS_ALLOWING_PREFIX_FILTER = /* @__PURE__ */ new Set([
  "cancelQueries",
  "removeQueries",
  "resetQueries",
  "prefetchQuery"
]);
var SKIP_TRAVERSE_KEYS = /* @__PURE__ */ new Set([
  "parent",
  "tokens",
  "comments",
  "loc",
  "range"
]);
function unwrapExpression(node) {
  let current = node;
  for (; ; ) {
    if (current.type === import_utils2.AST_NODE_TYPES.TSAsExpression) {
      current = current.expression;
      continue;
    }
    if (current.type === import_utils2.AST_NODE_TYPES.TSNonNullExpression) {
      current = current.expression;
      continue;
    }
    return current;
  }
}
function getSpreadPrefixText(node, getText) {
  const inner = unwrapExpression(node);
  if (inner.type !== import_utils2.AST_NODE_TYPES.ArrayExpression) {
    return null;
  }
  const { elements } = inner;
  if (elements.length < 2) {
    return null;
  }
  const firstElement = elements[0];
  if (firstElement === null || firstElement === void 0 || firstElement.type !== import_utils2.AST_NODE_TYPES.SpreadElement) {
    return null;
  }
  const { argument } = firstElement;
  if (argument.type !== import_utils2.AST_NODE_TYPES.Identifier && argument.type !== import_utils2.AST_NODE_TYPES.MemberExpression) {
    return null;
  }
  return getText(argument);
}
function findQueryKeyProperty(obj) {
  return obj.properties.find(
    (p) => p.type === import_utils2.AST_NODE_TYPES.Property && !p.computed && p.key.type === import_utils2.AST_NODE_TYPES.Identifier && p.key.name === "queryKey"
  );
}
function walkAst(node, visitor) {
  visitor(node);
  for (const key of Object.keys(node)) {
    if (SKIP_TRAVERSE_KEYS.has(key)) {
      continue;
    }
    const child = node[key];
    if (child === null || child === void 0) {
      continue;
    }
    if (Array.isArray(child)) {
      for (const c of child) {
        if (typeof c === "object" && c !== null && "type" in c) {
          walkAst(c, visitor);
        }
      }
    } else if (typeof child === "object" && "type" in child) {
      walkAst(child, visitor);
    }
  }
}
function collectExtendedPrefixes(program, getText) {
  const out = /* @__PURE__ */ new Set();
  walkAst(program, (node) => {
    if (node.type !== import_utils2.AST_NODE_TYPES.CallExpression) {
      return;
    }
    const { callee } = node;
    if (callee.type !== import_utils2.AST_NODE_TYPES.Identifier || !HOOK_NAMES.has(callee.name) || node.arguments[0]?.type !== import_utils2.AST_NODE_TYPES.ObjectExpression) {
      return;
    }
    const prop = findQueryKeyProperty(node.arguments[0]);
    if (prop === void 0) {
      return;
    }
    const prefix = getSpreadPrefixText(prop.value, getText);
    if (prefix !== null) {
      out.add(prefix);
    }
  });
  return out;
}
function queryFilterAllowsPrefixMatch(arg) {
  if (arg === void 0 || arg.type !== import_utils2.AST_NODE_TYPES.ObjectExpression) {
    return false;
  }
  for (const prop of arg.properties) {
    if (prop.type !== import_utils2.AST_NODE_TYPES.Property || prop.computed || prop.key.type !== import_utils2.AST_NODE_TYPES.Identifier) {
      continue;
    }
    if (prop.key.name === "predicate") {
      return true;
    }
    if (prop.key.name === "exact" && prop.value.type === import_utils2.AST_NODE_TYPES.Literal && prop.value.value === false) {
      return true;
    }
  }
  return false;
}
function getFirstArgQueryKeyText(args, getText) {
  const first = args[0];
  if (first === void 0) {
    return null;
  }
  if (first.type === import_utils2.AST_NODE_TYPES.ObjectExpression) {
    const prop = findQueryKeyProperty(first);
    if (prop === void 0) {
      return null;
    }
    return getText(unwrapExpression(prop.value));
  }
  if (first.type === import_utils2.AST_NODE_TYPES.SpreadElement) {
    return null;
  }
  return getText(unwrapExpression(first));
}
var prefixQueryKeyMustUseSetQueriesDataRule = createRule({
  name: "prefix-query-key-must-use-set-queries-data",
  meta: {
    type: "problem",
    docs: {
      description: "When a hook uses `queryKey: [...prefix, extra]`, do not call `setQueryData(prefix, \u2026)`, `cancelQueries({ queryKey: prefix })`, etc. \u2014 those only touch one cache entry. Use `setQueriesData({ queryKey: prefix }, \u2026)` and matcher-style `cancelQueries` / `invalidateQueries` so every variant is covered."
    },
    schema: [],
    messages: {
      useMatcherApi: "Query key spreads `{{prefix}}` with extra segments in this file. Use `setQueriesData` / predicate or `{ queryKey: prefix, exact: false }`-style APIs instead of `{{method}}` with the bare prefix (stale cache for other key variants)."
    }
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const getText = (n) => sourceCode.getText(n);
    return {
      "Program:exit"(program) {
        const extendedPrefixes = collectExtendedPrefixes(program, getText);
        if (extendedPrefixes.size === 0) {
          return;
        }
        walkAst(program, (node) => {
          if (node.type !== import_utils2.AST_NODE_TYPES.CallExpression) {
            return;
          }
          const { callee } = node;
          if (callee.type !== import_utils2.AST_NODE_TYPES.MemberExpression) {
            return;
          }
          if (callee.property.type !== import_utils2.AST_NODE_TYPES.Identifier) {
            return;
          }
          const method = callee.property.name;
          if (!PREFIX_UNSAFE_METHODS.has(method)) {
            return;
          }
          if (METHODS_ALLOWING_PREFIX_FILTER.has(method) && queryFilterAllowsPrefixMatch(node.arguments[0])) {
            return;
          }
          const keyText = getFirstArgQueryKeyText(node.arguments, getText);
          if (keyText === null || !extendedPrefixes.has(keyText)) {
            return;
          }
          context.report({
            node: callee.property,
            messageId: "useMatcherApi",
            data: { prefix: keyText, method }
          });
        });
      }
    };
  }
});

// src/rules/index.ts
var rules = {
  "prefix-query-key-must-use-set-queries-data": prefixQueryKeyMustUseSetQueriesDataRule
};

// src/index.ts
var plugin = {
  meta: {
    name: "eslint-plugin-tanstack-query-cache",
    version: "0.1.0"
  },
  rules,
  configs: {}
};
plugin.configs.recommended = {
  plugins: {
    "tanstack-query-cache": plugin
  },
  rules: recommendedRules
};
var configs = plugin.configs;
var src_default = plugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  configs,
  prefixQueryKeyMustUseSetQueriesDataRule,
  rules
});
