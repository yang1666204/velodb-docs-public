---
{
  "title": "ST_ASTEXT",
  "description": "幾何図形をWKT（Well Known Text）の表現に変換する",
  "language": "ja"
}
---
## デスクリプション

幾何図形をWKT（Well Known Text）の表現に変換します

## Alias

- ST_ASWKT

## Syntax

```sql
ST_ASTEXT(GEOMETRY <geo>)
```
## パラメータ

| パラメータ | 説明 |
| -- |----------|
| `<geo>` | 変換が必要なグラフ |

## Return Value

ジオメトリのWKT表現：

## Examples

```sql
SELECT ST_AsText(ST_Point(24.7, 56.7));
```
```text
+---------------------------------+
| st_astext(st_point(24.7, 56.7)) |
+---------------------------------+
| POINT (24.7 56.7)               |
+---------------------------------+
```
