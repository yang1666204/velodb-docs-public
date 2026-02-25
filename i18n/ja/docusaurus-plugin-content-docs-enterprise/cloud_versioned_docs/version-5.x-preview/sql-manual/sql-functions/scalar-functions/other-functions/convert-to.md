---
{
  "title": "I'm ready to translate the English technical documentation into Japanese. However, I notice that the text you provided only shows \"CONVERT_TO\" which appears to be a placeholder or incomplete. Could you please provide the actual English technical documentation text that you'd like me to translate?",
  "description": "列の文字エンコーディングを指定されたターゲット文字セットに変換します。",
  "language": "ja"
}
---
## Description

列の文字エンコーディングを指定したターゲット文字セットに変換します。この関数は通常、中国語文字を含む列がピンイン順でソートされるようにするため、ORDER BY句で使用されます。現在、`'gbk'`への変換のみサポートされています。

## Syntax

```sql
CONVERT_TO(<column>, <character>)
```
## Parameters

| Parameters      | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| `<column>`     | エンコーディングを変換するVARCHAR列。                       |
| `<character>`  | ターゲット文字セット。現在、`'gbk'`のみがサポートされています。             |

## Return Value

変換されたエンコーディングを持つVARCHAR値を返します。ORDER BY句で使用する際に、適切なピンインベースのソートを可能にします。

## Examples

```sql
SELECT * FROM class_test ORDER BY class_name;
```
```text
+----------+------------+-------------+
| class_id | class_name | student_ids |
+----------+------------+-------------+
|        6 | asd        | [6]         |
|        7 | qwe        | [7]         |
|        8 | z          | [8]         |
|        2 | 哈         | [2]         |
|        3 | 哦         | [3]         |
|        1 | 啊         | [1]         |
|        4 | 张         | [4]         |
|        5 | 我         | [5]         |
+----------+------------+-------------+
```
```sql
SELECT * FROM class_test ORDER BY CONVERT_TO(class_name, 'gbk');
```
```text
+----------+------------+-------------+
| class_id | class_name | student_ids |
+----------+------------+-------------+
|        6 | asd        | [6]         |
|        7 | qwe        | [7]         |
|        8 | z          | [8]         |
|        1 | 啊         | [1]         |
|        2 | 哈         | [2]         |
|        3 | 哦         | [3]         |
|        5 | 我         | [5]         |
|        4 | 张         | [4]         |
+----------+------------+-------------+
```
