---
{
  "title": "SHOW VIEW",
  "description": "この文は、指定されたテーブルに基づくすべてのビューを表示するために使用されます。",
  "language": "ja"
}
---
## Description

このステートメントは、指定されたテーブルに基づくすべてのビューを表示するために使用されます

grammar:

```sql
  SHOW VIEW { FROM | IN } table [ FROM db ]
```
## Example

1. テーブルtestTblに基づいて作成されたすべてのビューを表示する

    ```sql
    SHOW VIEW FROM testTbl;
    ```
## キーワード

    SHOW, VIEW

## ベストプラクティス
