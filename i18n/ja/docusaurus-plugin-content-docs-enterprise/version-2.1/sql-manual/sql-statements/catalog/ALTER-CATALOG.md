---
{
  "title": "ALTER CATALOG",
  "description": "この文は指定されたカタログのプロパティを設定するために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは、指定されたカタログのプロパティを設定するために使用されます。


## 構文
1) カタログの名前を変更する

    ```sql
    ALTER CATALOG <catalog_name> RENAME <new_catalog_name>;
    ```
2) カタログのプロパティを変更/追加する

    ```sql
    ALTER CATALOG <catalog_name> SET PROPERTIES ('<key>' = '<value>' [, ... ]); 
    ```
3) カタログのコメントを修正する

    ```sql
    ALTER CATALOG <catalog_name> MODIFY COMMENT "<new catalog comment>";
    ```
## 必須パラメータ

**1. `<catalog_name>`**

変更対象のカタログ名

**2. `<new_catalog_name>`**

変更後の新しいカタログ名

**3. `'<key>' = '<value>'`**

変更または追加が必要なカタログプロパティのキーと値

**4. `<new catalog comment>`**

変更後のカタログコメント


## アクセス制御要件
| Privilege  | Object  | 注釈                                     |
|:-----------|:--------|:------------------------------------------|
| ALTER_PRIV | カタログ | カタログのALTER_PRIVが必要 |
## 使用上の注意

1) カタログのリネーム
- ビルトインカタログ `internal` はリネームできません
- Alter権限以上を持つユーザーのみがカタログをリネームできます
- カタログのリネーム後は、REVOKEコマンドとGRANTコマンドを使用して適切なユーザー権限を変更してください

2) カタログのプロパティの変更/追加

- プロパティ `type` は変更できません。
- ビルトインカタログ `internal` のプロパティは変更できません。
- 指定されたキーの値を更新します。キーがカタログプロパティに存在しない場合は、追加されます。

3) カタログのコメントの変更

- ビルトインカタログ `internal` は変更できません

## 例

1. カタログctlg_hiveをhiveにリネーム

      ```sql
      ALTER CATALOG ctlg_hive RENAME hive;
      ```
2. catalog hiveの`hive.metastore.uris`プロパティを変更する

      ```sql
      ALTER CATALOG hive SET PROPERTIES ('hive.metastore.uris'='thrift://172.21.0.1:9083');
      ```
3. catalog hiveのコメントを変更する

      ```sql
      ALTER CATALOG hive MODIFY COMMENT "new catalog comment";
      ```
