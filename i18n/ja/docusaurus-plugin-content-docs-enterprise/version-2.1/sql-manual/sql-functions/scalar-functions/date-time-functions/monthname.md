---
{
  "title": "MONTHNAME",
  "description": "指定された日付に対応する月の英語名を返します。",
  "language": "ja"
}
---
## Description

指定された日付に対応する月の英語名を返します。戻り値は月の完全な英語名です（January から December まで）。

## Syntax

```sql
MONTHNAME(<date>)
```
## パラメータ

| Parameter | Description                                      |
|-----------|--------------------------------------------------|
| `<date>`  | 入力となる日時値で、DATE、DATETIME、またはDATETIMEV2型を指定可能 |

## 戻り値

月の英語名を表すVARCHAR型の値を返します：
- 戻り値の可能性：January、February、March、April、May、June、July、August、September、October、November、December
- 入力がNULLの場合、関数はNULLを返します。
- 戻り値の最初の文字は大文字で、残りの文字は小文字です。

## 例

```sql
SELECT MONTHNAME('2008-02-03 00:00:00');
```
```text
+---------------------------------------------------------+
| monthname(cast('2008-02-03 00:00:00' as DATETIMEV2(0))) |
+---------------------------------------------------------+
| February                                                |
+---------------------------------------------------------+
```
