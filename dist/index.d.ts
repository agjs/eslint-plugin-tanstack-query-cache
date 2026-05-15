import { TSESLint } from '@typescript-eslint/utils';
import * as _typescript_eslint_utils_ts_eslint from '@typescript-eslint/utils/ts-eslint';

declare const rules: {
    "prefix-query-key-must-use-set-queries-data": _typescript_eslint_utils_ts_eslint.RuleModule<"useMatcherApi", [], unknown, _typescript_eslint_utils_ts_eslint.RuleListener>;
};

declare const prefixQueryKeyMustUseSetQueriesDataRule: _typescript_eslint_utils_ts_eslint.RuleModule<"useMatcherApi", [], unknown, _typescript_eslint_utils_ts_eslint.RuleListener>;

type TanstackQueryCachePlugin = TSESLint.FlatConfig.Plugin & {
    configs: Record<string, TSESLint.FlatConfig.Config>;
};
declare const plugin: TanstackQueryCachePlugin;

declare const configs: TSESLint.FlatConfig.SharedConfigs & Record<string, TSESLint.FlatConfig.Config>;

export { configs, plugin as default, prefixQueryKeyMustUseSetQueriesDataRule, rules };
