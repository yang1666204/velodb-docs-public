---
{
  "title": "EXPLODE_JSON_OBJECT_OUTER",
  "description": "explodejsonobjectouter テーブル関数は、JSON オブジェクトを複数の行に展開し、各行にキーと値のペアを含めます。",
  "language": "ja"
}
---
# EXPLODE_JSON_OBJECT_OUTER
## 説明
`explode_json_object_outer` テーブル関数は、JSONオブジェクトを複数の行に展開し、各行にキーと値のペアを含めます。
JSONオブジェクトをよりクエリしやすい形式に変換するために一般的に使用されます。この関数は要素を持つJSONオブジェクトのみをサポートします。
[`LATERAL VIEW`](../../../query-data/lateral-view.md) と組み合わせて使用する必要があります。

## 構文

```sql
EXPLODE_JSON_OBJECT_OUTER(<json>)
```
## パラメータ
- `<json>` JSON型、内容はJSONオブジェクトである必要があります。

## 戻り値
- `<json>`内のすべての要素で構成される単一列、複数行の結果を返します。列の型は`Nullable<Struct<String, JSON>>`です。
- `<json>`がNULLまたはJSONオブジェクトではない場合（配列`[]`など）、NULLを含む1行が返されます。
- `<json>`が空のオブジェクトの場合（`{}`など）、NULLを含む1行が返されます。

## 例
0. データを準備

    ```sql
    create table example(
        k1 int
    ) properties(
        "replication_num" = "1"
    );

    insert into example values(1);
    ```
1. 通常パラメータ

    ```sql
    select  * from example lateral view explode_json_object_outer('{"k1": "v1", "k2": 123}') t2 as c;
    ```
    ```text
    +------+------------------------------+
    | k1   | c                            |
    +------+------------------------------+
    |    1 | {"col1":"k1", "col2":""v1""} |
    |    1 | {"col1":"k2", "col2":"123"}  |
    +------+------------------------------+
    ```
2. キーバリューペアを個別のカラムに展開する

    ```sql
    select  * from example lateral view explode_json_object_outer('{"k1": "v1", "k2": 123}') t2 as k, v;
    ```
    ```text
    +------+------+------+
    | k1   | k    | v    |
    +------+------+------+
    |    1 | k1   | "v1" |
    |    1 | k2   | 123  |
    +------+------+------+
    ```
> `v`の型はJSONです
3. 空のオブジェクト

    ```sql
    select  * from example lateral view explode_json_object_outer('{}') t2 as k, v;
    ```
    ```text
    +------+------+------+
    | k1   | k    | v    |
    +------+------+------+
    |    1 | NULL | NULL |
    +------+------+------+
    ```
4. NULLパラメータ

    ```sql
    select  * from example lateral view explode_json_object_outer(NULL) t2 as k, v;
    ```
    ```text
    +------+------+------+
    | k1   | k    | v    |
    +------+------+------+
    |    1 | NULL | NULL |
    +------+------+------+
    ```
5. 非オブジェクトパラメータ

    ```sql
    select  * from example lateral view explode_json_object_outer('[]') t2 as k, v;
    ```
    ```text
    +------+------+------+
    | k1   | k    | v    |
    +------+------+------+
    |    1 | NULL | NULL |
    ```
