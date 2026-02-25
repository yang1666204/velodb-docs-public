---
{
  "title": "SHOW STREAM LOAD",
  "description": "この文は、指定されたStream Loadタスクの実行状況を表示するために使用されます",
  "language": "ja"
}
---
### Description

このステートメントは、指定されたStream Loadタスクの実行を表示するために使用されます

grammar:

```sql
SHOW STREAM LOAD
[FROM db_name]
[
  WHERE
  [LABEL [ = "your_label" | LIKE "label_matcher"]]
  [STATUS = ["SUCCESS"|"FAIL"]]
]
[ORDER BY...]
[LIMIT limit][OFFSET offset];
```
illustrate:

1. デフォルトでは、BEはStream Loadレコードを記録しません。BEで有効化が必要なレコードを表示したい場合、設定パラメータは: `enable_stream_load_record=true`です。詳細については、BE Configuration Itemsを参照してください
2. db_nameが指定されていない場合、現在のデフォルトdbが使用されます
3. LABEL LIKEが使用された場合、Stream LoadタスクのlabelにLabel_matcherが含まれるタスクがマッチします
4. LABEL =が使用された場合、指定されたlabelと完全に一致します
5. STATUSが指定された場合、STREAM LOADステータスとマッチします
6. ORDER BYを使用して、任意のカラムの組み合わせでソートできます
7. LIMITが指定された場合、limit個のマッチするレコードが表示されます。それ以外の場合はすべて表示します
8. OFFSETが指定された場合、クエリ結果はoffset offsetから開始して表示されます。デフォルトではoffsetは0です。

## Example

1. デフォルトdbのすべてのStream Loadタスクを表示する

   ```sql
     SHOW STREAM LOAD;
   ```
2. 指定されたdbのStream Loadタスクを表示し、labelに文字列"2014_01_02"を含み、最も古い10件を表示する

   ```sql
   SHOW STREAM LOAD FROM example_db WHERE LABEL LIKE "2014_01_02" LIMIT 10;
   ```
3. 指定されたdbのStream Loadタスクを表示し、labelを"load_example_db_20140102"として指定する

   ```sql
   SHOW STREAM LOAD FROM example_db WHERE LABEL = "load_example_db_20140102";
   ```
4. 指定されたdbのStream Loadタスクを表示し、ステータスを"success"に指定して、StartTimeの降順でソートする

   ```sql
   SHOW STREAM LOAD FROM example_db WHERE STATUS = "success" ORDER BY StartTime DESC;
   ```
5. 指定されたdbのインポートタスクを表示し、StartTimeの降順でソートして、offset 5から開始する10件のクエリ結果を表示する

   ```sql
   SHOW STREAM LOAD FROM example_db ORDER BY StartTime DESC limit 5,10;
   SHOW STREAM LOAD FROM example_db ORDER BY StartTime DESC limit 10 offset 5;
   ```
## Keywords

SHOW、STREAM、LOAD
