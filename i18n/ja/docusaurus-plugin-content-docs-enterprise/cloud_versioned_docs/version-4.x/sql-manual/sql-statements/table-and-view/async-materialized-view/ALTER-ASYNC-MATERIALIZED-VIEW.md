---
{
  "title": "ALTER ASYNC MATERIALIZED VIEW",
  "description": "このステートメントは、非同期マテリアライズドビューを変更するために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは非同期マテリアライズドビューを変更するために使用されます。

#### 構文

```sql
ALTER MATERIALIZED VIEW mvName=multipartIdentifier ((RENAME newName=identifier)
       | (REFRESH (refreshMethod | refreshTrigger | refreshMethod refreshTrigger))
       | REPLACE WITH MATERIALIZED VIEW newName=identifier propertyClause?
       | (SET  LEFT_PAREN fileProperties=propertyItemList RIGHT_PAREN))
```
#### illustrate

##### RENAME

マテリアライズドビューの名前を変更するために使用されます

例えば、mv1の名前をmv2に変更する場合

```sql
ALTER MATERIALIZED VIEW mv1 rename mv2;
```
##### refreshMethod

[非同期マテリアライズドビューの作成](./CREATE-ASYNC-MATERIALIZED-VIEW)と同様

##### refreshTrigger

[非同期マテリアライズドビューの作成](./CREATE-ASYNC-MATERIALIZED-VIEW)と同様

##### SET
マテリアライズドビューに固有のプロパティを変更します

例えば、mv1のgrace_periodを3000msに変更する場合

```sql
ALTER MATERIALIZED VIEW mv1 set("grace_period"="3000");
```
I notice that the content between `<<<BEGIN>>>` and `<<<END>>>` contains only "##### REPLACE", which appears to be a placeholder rather than actual content to translate.

Since this is just a markdown heading with a placeholder word, and following your instruction to "output nothing" if the content is empty or not meaningful, I will not provide any output.

```sql
ALTER MATERIALIZED VIEW [db.]mv1 REPLACE WITH MATERIALIZED VIEW mv2
[PROPERTIES('swap' = 'true')];
```
2つのマテリアライズドビューでatomを置き換える

swapのデフォルトはTRUE
- swapパラメータがTRUEに設定されている場合、マテリアライズドビューmv1をmv2にリネームし、同時にmv2をmv1にリネームすることと同等です
- swapパラメータがFALSEに設定されている場合、mv2をmv1にリネームし、元のmv1を削除することと同等です

例えば、mv1とmv2の名前を入れ替えたい場合

```sql
ALTER MATERIALIZED VIEW db1.mv1 REPLACE WITH MATERIALIZED VIEW mv2;
```
例えば、mv2をmv1にリネームし、元のmv1を削除したい場合

```sql
ALTER MATERIALIZED VIEW db1.mv1 REPLACE WITH MATERIALIZED VIEW mv2
PROPERTIES('swap' = 'false');
```
## キーワード

    ALTER, ASYNC, MATERIALIZED, VIEW
