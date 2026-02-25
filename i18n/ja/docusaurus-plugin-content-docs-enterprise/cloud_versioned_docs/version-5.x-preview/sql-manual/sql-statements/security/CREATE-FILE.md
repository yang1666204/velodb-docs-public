---
{
  "title": "ファイルを作成",
  "description": "この文は、Dorisクラスターへのファイルの作成とアップロードに使用されます。",
  "language": "ja"
}
---
## Description

このステートメントは、Dorisクラスターにファイルを作成してアップロードするために使用されます。
この機能は通常、証明書、公開鍵と秘密鍵など、他のコマンドで使用する必要があるファイルを管理するために使用されます。

## Syntax

```sql
CREATE FILE <file_name>
        [ { FROM | IN } <database_name>] PROPERTIES ("<key>"="<value>" [ , ... ]);
```
## 必須パラメータ

**<file_name>**

**1. `<file_name>`**

> カスタムファイル名。

**2. `<key>`**

> ファイル属性キー。
> - **url**: 必須。認証なしHTTPダウンロードURLを指定します。実行成功後、ファイルはDorisに保存され、このURLは不要になります。
> - **catalog**: 必須。ファイル分類用のカテゴリ名（ユーザ定義）。特定のコマンドでファイルを検索する際に使用されます（例：スケジュール化されたインポートでKafkaがデータソースの場合、'kafka'カタログ下のファイルを検索）。
> - **md5**: オプション。ファイルのMD5チェックサム。指定された場合、ダウンロード後に検証が実行されます。

**3. `<value>`**

> ファイル属性値。

## オプションパラメータ

**1. `<database_name>`**

> ファイルが属するデータベースを指定します。指定されない場合は、現在のセッションのデータベースを使用します。

## アクセス制御要件

このSQLコマンドを実行するユーザは、少なくとも以下の権限を持つ必要があります：

| 権限 | オブジェクト | 注意事項 |
|:-------------|:------------|:--------------------------------------------------------------------------------|
| `ADMIN_PRIV` | User / Role | この操作を実行するには、ユーザまたはロールが`ADMIN_PRIV`権限を持つ必要があります |

## 使用上の注意

- ファイルアクセスルール

> 各ファイルは特定のデータベース（Database）に属します。データベースへのアクセス権限を持つユーザは、その中のすべてのファイルにアクセスできます。

- ファイルサイズと数量制限

> この機能は主に証明書などの小さなファイルを管理するために設計されています。  
> **サイズ制限**: 個々のファイルサイズは1MBに制限されます  
> **数量制限**: Dorisクラスタは最大100ファイルまでのアップロードをサポートします

## 例

- kafkaに分類されたファイルca.pemを作成

   ```sql
   CREATE FILE "ca.pem"
   PROPERTIES
   (
       "url" = "https://test.bj.bcebos.com/kafka-key/ca.pem",
       "catalog" = "kafka"
   );
   ```
- ファイル client.key を作成し、my_catalog として分類する

   ```sql
   CREATE FILE "client.key"
   IN my_database
   PROPERTIES
   (
       "url" = "https://test.bj.bcebos.com/kafka-key/client.key",
       "catalog" = "my_catalog",
       "md5" = "b5bb901bf10f99205b39a46ac3557dd9"
   );
   ```
- client_1.keyファイルを作成し、my_catalogとして分類する

  ```sql
    CREATE FILE "client_1.key"
    FROM my_database
    PROPERTIES
    (
       "url" = "https://test.bj.bcebos.com/kafka-key/client.key",
       "catalog" = "my_catalog",
       "md5" = "b5bb901bf10f99205b39a46ac3557dd9"
    );
    ```
