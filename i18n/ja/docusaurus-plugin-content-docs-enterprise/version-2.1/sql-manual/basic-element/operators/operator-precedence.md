---
{
  "title": "演算子の優先順位",
  "description": "演算子の優先順位は、式内で演算子が評価される順序を決定します。式に複数の演算子が含まれている場合、",
  "language": "ja"
}
---
## Description

演算子の優先順位は、式内で演算子が評価される順序を決定します。式に複数の演算子が含まれる場合、Dorisは演算子の優先順位の降順で計算を実行します。

## Operator Precedence

優先順位は上から下に向かって降順になっており、最上位が最も高い優先順位です。

| Precedence | Operator |
|------------|----------|
| 1          | !        |
| 2          | + (unary plus), - (unary minus), ~ (unary bitwise NOT), ^ |
| 3          | *, /, %, DIV |
| 4          | -, +     |
| 5          | &        |
| 6          | \|       |
| 7          | =(comparison), <=>, >=, >, <=, <, <>, !=, IS, LIKE, REGEXP, MATCH, IN |
| 8          | NOT      |
| 9          | AND, &&  |
| 10         | XOR      |
| 11         | OR       |
| 12         | \|\|     |
