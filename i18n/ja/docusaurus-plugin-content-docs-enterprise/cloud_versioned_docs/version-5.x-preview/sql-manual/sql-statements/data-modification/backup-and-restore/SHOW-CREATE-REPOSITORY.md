---
{
  "title": "SHOW CREATE REPOSITORY",
  "description": "この文は、リポジトリの作成文を実演するために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは、リポジトリの作成ステートメントを説明するために使用されます。

## 構文

```sql
SHOW CREATE REPOSITORY for <repo_name>;
```
## Required Parameters
**<repo_name>**
> リポジトリの一意の名前。

## Examples

指定されたリポジトリの作成文を表示する

```sql
SHOW CREATE REPOSITORY for test_repository;
```
