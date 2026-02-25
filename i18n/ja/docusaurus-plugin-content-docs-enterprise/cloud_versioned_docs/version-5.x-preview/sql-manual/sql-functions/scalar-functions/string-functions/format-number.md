---
{
  "title": "I don't see any text to translate after \"Text:\" in your message. You've provided \"FORMAT_NUMBER\" which appears to be a placeholder or identifier that should remain untranslated according to your rules.\n\nCould you please provide the actual English technical documentation text that you'd like me to translate into Japanese?",
  "description": "FORMATNUMBER関数は、数値を単位記号付きの文字列にフォーマットします。サポートされている単位は、K（千）、M（百万）、B（十億）です。",
  "language": "ja"
}
---
## 説明

FORMAT_NUMBER関数は、数値を単位記号付きの文字列に書式設定します。サポートされている単位は次のとおりです：K（千）、M（百万）、B（十億）、T（兆）、Q（千兆）。

## 構文

```sql
FORMAT_NUMBER(<val>)
```
## Parameters

| Parameter | Description |
| -------- | ----------------------------------------- |
| `<val>` | フォーマットする数値。型: DOUBLE |

## Return Value

VARCHAR型を返し、単位記号付きでフォーマットされた文字列を表します。

特殊なケース:
- パラメータがNULLの場合、NULLを返す
- 1000未満の数値は単位なしでそのまま返される
- 単位変換ルール:
  - K: thousand (1,000)
  - M: million (1,000,000)
  - B: billion (1,000,000,000)
  - T: trillion (1,000,000,000,000)
  - Q: quadrillion (1,000,000,000,000,000)

## Examples

1. 基本的な使用法: thousand (K)

```sql
SELECT format_number(1500);
```
```text
+---------------------+
| format_number(1500) |
+---------------------+
| 1.50K               |
+---------------------+
```
2. Million (M)

```sql
SELECT format_number(5000000);
```
```text
+------------------------+
| format_number(5000000) |
+------------------------+
| 5.00M                  |
+------------------------+
```
3. 千未満の数値

```sql
SELECT format_number(999);
```
```text
+----------------------------------+
| format_number(cast(999 as DOUBLE))|
+----------------------------------+
| 999                              |
+----------------------------------+
```
4. NULL値の処理

```sql
SELECT format_number(NULL);
```
```text
+---------------------+
| format_number(NULL) |
+---------------------+
| NULL                |
+---------------------+
```
