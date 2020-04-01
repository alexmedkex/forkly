// ajv-keywords.d.ts

type AjvAdditionalKeywords =
| 'typeof'
| 'instanceof'
| 'range'
| 'exclusiveRange'
| 'switch'
| 'select'
| 'selectCases'
| 'selectDefault'
| 'patternRequired'
| 'prohibited'
| 'deepProperties'
| 'deepRequired'
| 'uniqueItemProperties'
| 'regexp'
| 'formatMaximum'
| 'formatMinimum'
| 'formatExclusiveMaximum'
| 'formatExclusiveMinimum'
| 'dynamicDefaults';

declare module 'ajv-keywords' {
  import { Ajv } from 'ajv';

  function keywords(ajv: Ajv, include?: AjvAdditionalKeywords | AjvAdditionalKeywords[]): void;
  export = keywords;
}