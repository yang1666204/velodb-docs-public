---
{
  "title": "ST_LINEFROMTEXT",
  "description": "WKT (Well Known Text) をLine形式のメモリ表現に変換します。",
  "language": "ja"
}
---
## デスクリプション

WKT（Well Known Text）をLine形式のメモリ表現に変換します

## Alias

- ST_LINESTRINGFROMTEXT

## Syntax

```sql
ST_LINEFROMTEXT( <wkt>)
```
## パラメータ

| パラメータ  | Instructions         |
|-----|------------|
| `<wkt>` | 2つの座標からなる線分 |

## Return Value

線分のメモリ形式。

## Examples

```sql
SELECT ST_AsText(ST_LineFromText("LINESTRING (1 1, 2 2)"));
```
```text
+---------------------------------------------------------+
| st_astext(st_geometryfromtext('LINESTRING (1 1, 2 2)')) |
+---------------------------------------------------------+
| LINESTRING (1 1, 2 2)                                   |
+---------------------------------------------------------+
```
