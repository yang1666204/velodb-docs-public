---
{
  "title": "MIN",
  "description": "MIN関数は式の最小値を返します。",
  "language": "ja"
}
---
## 説明

MIN関数は式の最小値を返します。

## 構文

```sql
MIN(expr)
```
## パラメータ

| パラメータ | デスクリプション |
| -- | -- |
| `<expr>` | 取得する必要がある式 |

## Return Value

入力式と同じデータ型を返します。

## Example

```sql
select MIN(scan_rows) from log_statis group by datetime;
```
```text
+------------------+
| MIN(`scan_rows`) |
+------------------+
|                0 |
+------------------+
```
