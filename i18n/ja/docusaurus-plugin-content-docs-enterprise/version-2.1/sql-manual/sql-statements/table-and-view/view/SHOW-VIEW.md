---
{
  "title": "VIEW を表示",
  "description": "この文は、指定されたTableに基づくすべてのビューを表示するために使用されます",
  "language": "ja"
}
---
## デスクリプション

このステートメントは、指定されたTableに基づくすべてのビューを表示するために使用されます

grammar:

```sql
SHOW VIEW { FROM | IN } table [ FROM db ]
```
## Examples

1. TabletestTblに基づいて作成されたすべてのビューを表示する

    ```sql
    SHOW VIEW FROM testTbl;
    ```
## Keywords

SHOW, VIEW
