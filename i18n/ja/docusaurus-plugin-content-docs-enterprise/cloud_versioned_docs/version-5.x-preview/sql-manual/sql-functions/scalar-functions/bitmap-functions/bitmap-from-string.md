---
{
  "title": "BITMAP_FROM_STRING",
  "description": "文字列をBITMAPに変換します。文字列は、カンマで区切られた符号なしbigint数値のグループで構成されます。",
  "language": "ja"
}
---
## Description

文字列をBITMAPに変換します。文字列は、カンマで区切られた符号なしbigint数値のグループで構成されます。（数値の範囲：0 ~ 18446744073709551615）
例えば、文字列"0, 1, 2"は、0番目、1番目、2番目のビットが設定されたBitmapに変換されます。入力フィールドが無効な場合、NULLが返されます

## Syntax

```sql
 BITMAP_FROM_STRING(<str>)
```
## Parameters

| Parameter | Description                                                                                    |
|-----------|------------------------------------------------------------------------------------------------|
| `<str>`   | 配列文字列。例えば "0, 1, 2" 文字列はビット0、1、2がセットされたBitmapに変換されます |  

## Return Value

BITMAPを返します
- 入力フィールドが無効な場合、結果はNULLになります

## Examples

```sql
select bitmap_to_string(bitmap_from_string("0, 1, 2")) bts;
```
```text
+-------+
| bts   |
+-------+
| 0,1,2 |
+-------+
```
```sql
select bitmap_to_string(bitmap_from_string("-1, 0, 1, 2")) bfs;
```
```text
+------+
| bfs  |
+------+
| NULL |
+------+
```
```sql
select bitmap_to_string(bitmap_from_string(NULL)) bfs;
```
```text
+------+
| bfs  |
+------+
| NULL |
+------+
```
```sql
select bitmap_to_string(bitmap_from_string("18446744073709551616, 1")) bfs;
```
```text
+------+
| bfs  |
+------+
| NULL |
+------+
```
```sql
select bitmap_to_string(bitmap_from_string("0, 1, 18446744073709551615")) bts;
```
```text
+--------------------------+
| bts                      |
+--------------------------+
| 0,1,18446744073709551615 |
+--------------------------+
```
