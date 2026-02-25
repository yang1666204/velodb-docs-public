---
{
  "title": "NGRAM_SEARCH",
  "description": "textとpatternの間のN-gramの類似度を計算します。類似度は0から1の範囲で、",
  "language": "ja"
}
---
## 概要

`text`と`pattern`間のN-gram類似度を計算します。類似度は0から1の範囲で、高い類似度は2つの文字列間のより大きな類似性を示します。

`pattern`と`gram_num`の両方は定数である必要があります。`text`または`pattern`のいずれかの長さが`gram_num`より短い場合、0を返します。

N-gram類似度は、N-gramに基づいてテキストの類似度を計算する方法です。N-gramは、テキスト文字列から抽出された連続するN個の文字または単語のセットです。例えば、文字列「text」でN=2（bigram）の場合、bigramは次のようになります：{"te", "ex", "xt"}。

N-gram類似度は以下のように計算されます：

2 * |Intersection| / (|text set| + |pattern set|)

ここで|text set|と|pattern set|は`text`と`pattern`のN-gramであり、`Intersection`は2つのセットの積集合です。

定義上、類似度が1であっても、2つの文字列が同一であることを必ずしも意味しないことに注意してください。

ASCII エンコーディングのみをサポートします。

## 構文

`DOUBLE ngram_search(VARCHAR text,VARCHAR pattern,INT gram_num)`

## 例

```sql
mysql> select ngram_search('123456789' , '12345' , 3);
+---------------------------------------+
| ngram_search('123456789', '12345', 3) |
+---------------------------------------+
|                                   0.6 |
+---------------------------------------+

mysql> select ngram_search("abababab","babababa",2);
+-----------------------------------------+
| ngram_search('abababab', 'babababa', 2) |
+-----------------------------------------+
|                                       1 |
+-----------------------------------------+
```
## keywords
    NGRAM_SEARCH,NGRAM,SEARCH
