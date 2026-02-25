---
{
  "title": "SHOW CREATE REPOSITORY",
  "description": "この文は、リポジトリの作成文を実演するために使用されます。",
  "language": "ja"
}
---
## Description

この文は、リポジトリの作成文を実演するために使用されます。

## Syntax

```sql
SHOW CREATE REPOSITORY for <repo_name>;
```
## 必須パラメータ
**<repo_name>**
> リポジトリの一意の名前。

## 例

指定されたリポジトリの作成ステートメントを表示する

```sql
SHOW CREATE REPOSITORY for test_repository;
```
