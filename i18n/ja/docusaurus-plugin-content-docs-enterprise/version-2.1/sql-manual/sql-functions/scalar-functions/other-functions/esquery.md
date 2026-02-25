---
{
  "title": "ESQUERY",
  "description": "ESQUERY(<field>, <querydsl>) 関数を使用して、SQLで表現できないクエリをElasticsearchにプッシュダウンしてフィルタリングを行います。",
  "language": "ja"
}
---
## 説明

SQL で表現できないクエリを Elasticsearch にプッシュダウンしてフィルタリングを行うには、`ESQUERY(<field>, <query_dsl>)` 関数を使用します。最初のパラメータ `<field>` はインデックスの関連付けに使用され、2番目のパラメータ `<query_dsl>` は基本的な Elasticsearch Query DSL を表すJSON式です。JSON は波括弧 `{}` で囲む必要があり、ちょうど1つのルートキー（例：`match_phrase`、`geo_shape`、`bool`）を含む必要があります。

## 構文

```sql
ESQUERY(<field>, <query_dsl>)
```
## パラメータ

| Parameter   | Description                                                                                 |
|------------|---------------------------------------------------------------------------------------------|
| `<field>`    | クエリ対象となるフィールド。インデックスの関連付けに使用される。                                         |
| `<query_dsl>` | Elasticsearch Query DSLを表すJSON式。`{}`で囲まれ、ちょうど1つのルートキー（例：`match_phrase`、`geo_shape`、`bool`）を含む必要がある。 |

## 戻り値

ドキュメントが提供されたElasticsearch query DSLにマッチするかどうかを示すboolean値を返す。

## 例

```sql
-- match_phrase SQL:
SELECT * FROM es_table 
WHERE ESQUERY(k4, '{
    "match_phrase": {
       "k4": "doris on es"
    }
}');
```
```sql
-- geo_shape SQL:
SELECT * FROM es_table 
WHERE ESQUERY(k4, '{
  "geo_shape": {
     "location": {
        "shape": {
           "type": "envelope",
           "coordinates": [
              [13, 53],
              [14, 52]
           ]
        },
        "relation": "within"
     }
  }
}');
```
