---
{
  "title": "ALTER-SYSTEM-RENAME-COMPUTE-GROUP",
  "description": "ALTER SYSTEM RENAME COMPUTE-GROUP",
  "language": "ja"
}
---
## ALTER-SYSTEM-RENAME-COMPUTE-GROUP


### Name

ALTER SYSTEM RENAME COMPUTE-GROUP

### Description

compute groupの名前変更に使用されます（管理者のみ使用可能！）

grammar:

- ストレージとコンピューティングの分離クラスターにおいて、このステートメントは既存のcompute groupの名前を変更するために使用されます。この操作は同期的であり、実行が完了するとコマンドが返されます。

```sql
ALTER SYSTEM RENAME COMPUTE GROUP <old_name> <new_name>
```
注意事項:
1. コンピュートグループの命名規則は、DORISにおけるデータベースとテーブル名の命名規則と一致しています。
2. 現在のストレージ・コンピューティング分離クラスター内のすべてのコンピュートグループは、[SHOW COMPUTE GROUPS](../compute-management/SHOW-COMPUTE-GROUPS)を使用して表示できます。
3. リネーム操作の完了後、[SHOW COMPUTE GROUPS](../compute-management/SHOW-COMPUTE-GROUPS)を使用して確認することもできます。
4. リネーム操作が失敗した場合、元のコンピュートグループが存在しない、または元のコンピュートグループ名と対象のコンピュートグループ名が同じであるなどの理由について、返されたメッセージを確認できます。

### 例

1. old_nameという名前のコンピュートグループをnew_nameにリネームする。

```sql
ALTER SYSTEM RENAME COMPUTE GROUP <old_name> <new_name>
```
### Keywords

ALTER, SYSTEM, RENAME, ALTER SYSTEM
