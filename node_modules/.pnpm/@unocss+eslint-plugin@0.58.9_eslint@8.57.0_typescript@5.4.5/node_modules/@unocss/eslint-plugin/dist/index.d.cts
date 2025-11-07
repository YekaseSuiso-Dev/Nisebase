import * as _typescript_eslint_utils_eslint_utils from '@typescript-eslint/utils/eslint-utils';

declare const _default: {
    configs: {
        recommended: {
            plugins: string[];
            rules: {
                readonly '@unocss/order': "warn";
                readonly '@unocss/order-attributify': "warn";
            };
        };
        flat: {
            plugins: {
                unocss: {
                    rules: {
                        order: _typescript_eslint_utils_eslint_utils.RuleWithMeta<[], "">;
                        'order-attributify': _typescript_eslint_utils_eslint_utils.RuleWithMeta<[], "">;
                        blocklist: _typescript_eslint_utils_eslint_utils.RuleWithMeta<[], "">;
                        'enforce-class-compile': _typescript_eslint_utils_eslint_utils.RuleWithMeta<[], "">;
                    };
                };
            };
            rules: {
                readonly 'unocss/order': "warn";
                readonly 'unocss/order-attributify': "warn";
            };
        };
    };
    rules: {
        order: _typescript_eslint_utils_eslint_utils.RuleWithMeta<[], "">;
        'order-attributify': _typescript_eslint_utils_eslint_utils.RuleWithMeta<[], "">;
        blocklist: _typescript_eslint_utils_eslint_utils.RuleWithMeta<[], "">;
        'enforce-class-compile': _typescript_eslint_utils_eslint_utils.RuleWithMeta<[], "">;
    };
};

export { _default as default };
