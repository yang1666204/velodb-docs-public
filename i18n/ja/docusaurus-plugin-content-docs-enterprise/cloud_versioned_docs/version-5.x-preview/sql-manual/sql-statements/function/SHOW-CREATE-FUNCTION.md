---
{
  "title": "SHOW CREATE FUNCTION",
  "description": "この文は、ユーザー定義関数の作成文を表示するために使用されます",
  "language": "ja"
}
---
## 説明

このステートメントは、ユーザー定義関数の作成ステートメントを表示するために使用されます

## 構文

```sql
SHOW CREATE [ GLOBAL ] FUNCTION <function_name>( <arg_type> ) [ FROM <db_name> ];
```
## 必須パラメータ

**1. `<function_name>`**

> 作成文をクエリしたいカスタム関数の名前。

**2. `<arg_type>`**

> 作成文をクエリする必要があるカスタム関数のパラメータリスト。
>
> パラメータリストの位置では、位置パラメータのデータ型を入力する必要があります

## オプションパラメータ

**1.`GLOBAL`**

> GLOBALはオプションパラメータです。
>
> GLOBALが設定されている場合、関数はグローバルに検索され削除されます。
>
> GLOABLが入力されていない場合、関数は現在のデータベースで検索され削除されます。

**2.`<db_name>`**

> FROM db_nameは、カスタム関数が指定されたデータベースからクエリされることを示します

## 戻り値

| カラム          | 説明          |
|-----------------|-------------|
| SYMBOL          | 関数パッケージ名        |
| FILE            | jarパッケージのパス     |
| ALWAYS_NULLABLE | 結果がNULLになる可能性があるかどうか |
| TYPE            | 関数のタイプ        |

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| 権限 | オブジェクト   | 備考       |
|:----------|:---------|:--------------|
| SHOW_PRIV | Function | この関数に対するshow権限が必要 |

## 例

```sql
SHOW CREATE FUNCTION add_one(INT)
```
```text
| Function Signature | Create Function
+--------------------+-------------------------------------------------------
| add_one(INT)       | CREATE FUNCTION add_one(INT) RETURNS INT PROPERTIES (
  "SYMBOL"="org.apache.doris.udf.AddOne",
  "FILE"="file:///xxx.jar",
  "ALWAYS_NULLABLE"="true",
  "TYPE"="JAVA_UDF"
  ); |
+--------------------+-------------------------------------------------------
```
