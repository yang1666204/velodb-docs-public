---
{
  "title": "BITMAP_COUNT",
  "description": "入力BITMAPの要素数をカウントします",
  "language": "ja"
}
---
## 説明

入力BITMAPの要素数を数えます

## 構文

```sql
BITMAP_COUNT(<bitmap>)
```
## Parameters

| Parameter  | Description |
|------------|-------------|
| `<bitmap>` | BITMAP    |

## Return Value

整数を返します

## Examples

```sql
select bitmap_count(to_bitmap(1)) cnt;
```
```text
+------+
| cnt  |
+------+
|    1 |
+------+
```
```sql
select bitmap_count(bitmap_empty()) cnt;
```
```text
+------+
| cnt  |
+------+
|    0 |
+------+
```
