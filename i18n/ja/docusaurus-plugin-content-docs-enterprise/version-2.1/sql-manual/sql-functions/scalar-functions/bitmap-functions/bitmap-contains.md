---
{
  "title": "BITMAP_CONTAINS",
  "description": "入力値がBITMAP内に存在するかどうかを計算し、ブール値を返します。",
  "language": "ja"
}
---
## 説明

入力値がBITMAPに含まれているかどうかを計算し、boolean値を返します。

## 構文

```sql
BITMAP_CONTAINS(<bitmap>, <bigint>)
```
## パラメータ

| Parameter  | Description                             |
|------------|-----------------------------------------|
| `<bitmap>` | BITMAP コレクション                       |
| `<bitint>` | 存在を確認する整数                         |

## 戻り値

boolean を返す
- パラメータが空の場合、NULL を返す

## 例

```sql
select bitmap_contains(to_bitmap(1),2) cnt1, bitmap_contains(to_bitmap(1),1) cnt2;
```
```text
+------+------+
| cnt1 | cnt2 |
+------+------+
|    0 |    1 |
+------+------+
```
