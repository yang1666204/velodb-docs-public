---
{
  "title": "ブール値テスト演算子",
  "description": "この演算子は、TRUE、FALSE、またはNULLをチェックするためにのみ使用されます。NULLの概要については、「Nulls」セクションを参照してください。",
  "language": "ja"
}
---
## 説明

このoperatorはTRUE、FALSE、またはNULLをチェックするために専用に使用されます。NULLの概要については、「Nulls」セクションを参照してください。

## Operator紹介

| Operator | 機能 | 例 |
| -------------------- | ------------------------------------------------------------ | ------------------------ |
| `x IS [NOT] TRUE` | xがTRUEかどうかをチェックします。xがTRUEの場合はTRUEを返し、そうでなければFALSEを返します。 | `SELECT 1 IS NOT TRUE` |
| `x IS [NOT] FALSE` | xがFALSEかどうかをチェックします。xがFALSEの場合はTRUEを返し、そうでなければFALSEを返します。 | `SELECT 1 IS NOT FALSE` |
| `x IS [NOT] NULL` | xがNULLかどうかをチェックします。xがNULLの場合はTRUEを返し、そうでなければFALSEを返します。 | `SELECT 1 IS NOT NULL` |
