---
{
  "title": "BITMAP_TO_STRING",
  "description": "Bitmapを、設定されたすべてのビット位置を含むカンマ区切りの文字列に変換します。",
  "language": "ja"
}
---
## Description

Bitmapを、設定されているビット位置をすべて含むカンマ区切りの文字列に変換します。

## Syntax

```sql
BITMAP_TO_STRING(<bitmap>)
```
## Parameters

| Parameter  | Description                     |
|------------|---------------------------------|
| `<bitmap>` | Bitmap型の列または式 |

## Return Value

Bitmap内の設定されたすべてのビット位置をカンマ区切りで含む文字列。  
Bitmapが`NULL`の場合は`NULL`を返します。

## Examples

`NULL`のBitmapを文字列に変換するには：

```sql
select bitmap_to_string(null);
```
結果は以下のようになります：

```text
+------------------------+
| bitmap_to_string(NULL) |
+------------------------+
| NULL                   |
+------------------------+
```
空のBitmapを文字列に変換するには:

```sql
select bitmap_to_string(bitmap_empty());
```
結果は次のようになります：

```text
+----------------------------------+
| bitmap_to_string(bitmap_empty()) |
+----------------------------------+
|                                  |
+----------------------------------+
```
単一要素を持つBitmapを文字列に変換するには：

```sql
select bitmap_to_string(to_bitmap(1));
```
結果は以下のようになります：

```text
+--------------------------------+
| bitmap_to_string(to_bitmap(1)) |
+--------------------------------+
| 1                              |
+--------------------------------+
```
複数の要素を持つBitmapを文字列に変換するには:

```sql
select bitmap_to_string(bitmap_or(to_bitmap(1), to_bitmap(2)));
```
結果は次のようになります：

```text
+---------------------------------------------------------+
| bitmap_to_string(bitmap_or(to_bitmap(1), to_bitmap(2))) |
+---------------------------------------------------------+
| 1,2                                                     |
+---------------------------------------------------------+
```
