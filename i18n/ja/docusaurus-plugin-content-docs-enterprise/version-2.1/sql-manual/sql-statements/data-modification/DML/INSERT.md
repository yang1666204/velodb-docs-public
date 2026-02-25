---
{
  "title": "I'm ready to translate your English technical documentation into Japanese following all the specified rules and requirements. However, I notice that the text you want me to translate just says \"INSERT\" - it appears you may have forgotten to include the actual content you'd like translated.\n\nPlease provide the English technical documentation text you'd like me to translate, and I'll translate it according to your specifications.",
  "description": "change文は、データ挿入操作を完了するためのものです。",
  "language": "ja"
}
---
## Description

change文は、データ挿入操作を完了するためのものです。

```sql
INSERT INTO table_name
    [ PARTITION (p1, ...) ]
    [ WITH LABEL label]
    [ (column [, ...]) ]
    [ [ hint [, ...] ] ]
    { VALUES ( { expression | DEFAULT } [, ...] ) [, ...] | query }
```
パラメータ

> tablet_name: データをインポートする宛先テーブル。`db_name.table_name`の形式で指定可能
>
> partitions: インポートするパーティションを指定。`table_name`に存在するパーティションである必要がある。複数のパーティション名はカンマで区切る
>
> label: Insertタスクのラベルを指定
>
> column_name: 指定する宛先列。`table_name`に存在する列である必要がある
>
> expression: 列に割り当てる必要がある対応する式
>
> DEFAULT: 対応する列にデフォルト値を使用させる
>
> query: 一般的なクエリ。クエリの結果がターゲットに書き込まれる
>
> hint: `INSERT`の実行動作を示すために使用される指標。次の値のいずれかを選択可能：`/*+ STREAMING */`、`/*+ SHUFFLE */`、または`/*+ NOSHUFFLE */`
> 1. STREAMING: 現在は実用的な効果はなく、以前のバージョンとの互換性のためにのみ保持されている（以前のバージョンでは、このhintを追加するとラベルが返されていたが、現在はデフォルトでラベルを返す）
> 2. SHUFFLE: ターゲットテーブルがパーティションテーブルの場合、このhintを有効にするとrepartiitonが実行される
> 3. NOSHUFFLE: ターゲットテーブルがパーティションテーブルであってもrepartiitonは実行されないが、データが各パーティションに正しく配置されることを保証するために他の操作が実行される

merge-on-writeが有効なUniqueテーブルでは、insert文を使用して部分列更新も実行できます。insert文で部分列更新を実行するには、セッション変数enable_unique_key_partial_updateをtrueに設定する必要があります（この変数のデフォルト値はfalseで、insert文による部分列更新はデフォルトでは許可されていないことを意味します）。部分列更新を実行する際は、挿入する列に少なくともすべてのKey列が含まれ、更新したい列を指定する必要があります。挿入する行のKey列の値が元のテーブルに既に存在する場合、同じキー列値を持つ行のデータが更新されます。挿入する行のKey列の値が元のテーブルに存在しない場合、新しい行がテーブルに挿入されます。この場合、insert文で指定されていない列はデフォルト値を持つかnullableである必要があります。これらの欠落している列は、まずデフォルト値で埋められ、列にデフォルト値がない場合はnullで埋められます。列がnullにできない場合、insert操作は失敗します。

insert文が厳密モードで動作するかを制御するセッション変数`enable_insert_strict`のデフォルト値はtrueであることに注意してください。つまり、insert文はデフォルトで厳密モードであり、このモードでは部分列更新において存在しないキーの更新は許可されません。そのため、insert文を部分列更新に使用し、存在しないキーを挿入したい場合は、`enable_unique_key_partial_update`をtrueに設定し、同時に`enable_insert_strict`をfalseに設定する必要があります。

注意：

`INSERT`文を実行する際、デフォルトの動作では文字列が長すぎるなど、ターゲットテーブルの形式に適合しないデータをフィルタリングします。ただし、データをフィルタリングしないことが要求されるビジネスシナリオでは、セッション変数`enable_insert_strict`を`true`に設定して、データがフィルタリングされた際に`INSERT`が正常に実行されないことを保証できます。

## Examples

`test`テーブルは`c1`、`c2`の2つの列を含んでいます。

1. `test`テーブルに1行のデータをインポート

```sql
INSERT INTO test VALUES (1, 2);
INSERT INTO test (c1, c2) VALUES (1, 2);
INSERT INTO test (c1, c2) VALUES (1, DEFAULT);
INSERT INTO test (c1) VALUES (1);
```
最初と2番目のステートメントは同じ効果を持ちます。対象列が指定されていない場合、テーブル内の列順序がデフォルトの対象列として使用されます。
3番目と4番目のステートメントは同じ意味を表し、`c2`列のデフォルト値を使用してデータインポートを完了します。

2. `test`テーブルに複数行のデータを一度にインポートする

```sql
INSERT INTO test VALUES (1, 2), (3, 2 + 2);
INSERT INTO test (c1, c2) VALUES (1, 2), (3, 2 * 2);
INSERT INTO test (c1) VALUES (1), (3);
INSERT INTO test (c1, c2) VALUES (1, DEFAULT), (3, DEFAULT);
```
最初と2番目のステートメントは同じ効果を持ち、一度に2つのデータを`test`テーブルにインポートします。
3番目と4番目のステートメントの効果は既知であり、`c2`列のデフォルト値を使用して2つのデータを`test`テーブルにインポートします。

3. クエリ結果を`test`テーブルにインポートする

```sql
INSERT INTO test SELECT * FROM test2;
INSERT INTO test (c1, c2) SELECT * from test2;
```
4. クエリ結果を`test`テーブルにインポートし、パーティションとラベルを指定する

```sql
INSERT INTO test PARTITION(p1, p2) WITH LABEL `label1` SELECT * FROM test2;
INSERT INTO test WITH LABEL `label1` (c1, c2) SELECT * from test2;
```
## Keywords

    INSERT

## Best Practice

1. 返された結果を確認する

   INSERT操作は同期操作であり、結果の返却は操作の終了を示します。ユーザーは返される異なる結果に応じて対応する処理を実行する必要があります。

   1. 実行が成功し、結果セットが空の場合

      selectステートメントに対応するinsertの結果セットが空の場合、以下のように返されます：

      ```sql
      mysql> insert into tbl1 select * from empty_tbl;
      Query OK, 0 rows affected (0.02 sec)
      ```
`Query OK`は実行が成功したことを示します。`0 rows affected`は、データがインポートされなかったことを意味します。

   2. 実行が成功し、結果セットが空ではない

      結果セットが空でない場合。返される結果は以下の状況に分けられます：

      1. Insertが正常に実行され、表示される：

         ```sql
         mysql> insert into tbl1 select * from tbl2;
         Query OK, 4 rows affected (0.38 sec)
         {'label':'insert_8510c568-9eda-4173-9e36-6adc7d35291c', 'status':'visible', 'txnId':'4005'}
         
         mysql> insert into tbl1 with label my_label1 select * from tbl2;
         Query OK, 4 rows affected (0.38 sec)
         {'label':'my_label1', 'status':'visible', 'txnId':'4005'}
         
         mysql> insert into tbl1 select * from tbl2;
         Query OK, 2 rows affected, 2 warnings (0.31 sec)
         {'label':'insert_f0747f0e-7a35-46e2-affa-13a235f4020d', 'status':'visible', 'txnId':'4005'}
         
         mysql> insert into tbl1 select * from tbl2;
         Query OK, 2 rows affected, 2 warnings (0.31 sec)
         {'label':'insert_f0747f0e-7a35-46e2-affa-13a235f4020d', 'status':'committed', 'txnId':'4005'}
         ```
`Query OK`は実行が成功したことを示します。`4 rows affected`は合計4行のデータがインポートされたことを意味します。`2 warnings`はフィルタリングされる行数を示します。

         また、json文字列を返します：

         ```json
         {'label':'my_label1', 'status':'visible', 'txnId':'4005'}
         {'label':'insert_f0747f0e-7a35-46e2-affa-13a235f4020d', 'status':'committed', 'txnId':'4005'}
         {'label':'my_label1', 'status':'visible', 'txnId':'4005', 'err':'some other error'}
         ```
`label`はユーザー指定のラベルまたは自動生成されたラベルです。LabelはこのInsert Into importジョブのIDです。各importジョブは単一のデータベース内で一意のLabelを持ちます。

         `status`はインポートされたデータが表示可能かどうかを示します。表示可能な場合は`visible`、表示不可能な場合は`committed`を表示します。

         `txnId`はこのinsertに対応するインポートトランザクションのidです。

         `err`フィールドはその他の予期しないエラーを表示します。

         フィルタリングされた行を表示する必要がある場合、ユーザーは以下のステートメントを渡すことができます

         ```sql
         show load where label="xxx";
         ```
返された結果のURLは、誤ったデータをクエリするために使用できます。詳細については、後述の**Viewing Error Lines**の概要を参照してください。

**データの不可視性は一時的な状態であり、このバッチのデータは最終的に可視になります**

以下のステートメントで、このバッチのデータの可視ステータスを確認できます：

         ```sql
         show transaction where id=4005;
         ```
返された結果の`TransactionStatus`列が`visible`の場合、表現データは可視状態です。

   3. 実行失敗

      実行失敗は、データが正常にインポートされなかったことを示し、以下が返されます：

      ```sql
      mysql> insert into tbl1 select * from tbl2 where k1 = "a";
      ERROR 1064 (HY000): all partitions have no load data. url: http://10.74.167.16:8042/api/_load_error_log?file=__shard_2/error_log_insert_stmt_ba8bb9e158e4879-ae8de8507c0bf8a2_ba8bb9e158e4879_ae8de8507c0
      ```
`ERROR 1064 (HY000): all partitions have no load data`は失敗の理由を示しています。以下のurlを使用して、間違ったデータをクエリできます：

      ```sql
      show load warnings on "url";
      ```
特定のエラー行を確認できます。

2. タイムアウト時間

    INSERT操作のタイムアウトはmax(insert_timeout, query_timeout)によって制御されます。両方とも環境変数で、insert_timeoutのデフォルトは4時間、query_timeoutのデフォルトは5分です。操作がタイムアウトを超えた場合、ジョブはキャンセルされます。insert_timeoutの導入は、INSERT文がより長いデフォルトタイムアウトを持つことを保証し、通常のクエリに適用される短いデフォルトタイムアウトによってインポートタスクが影響を受けないようにするためです。

3. Labelと原子性

   INSERT操作はインポートの原子性も保証します。Import Transactions and Atomicityドキュメントを参照してください。

   insert操作でクエリ部分として`CTE(Common Table Expressions)`を使用する場合、`WITH LABEL`と`column`部分を指定する必要があります。

4. Filter Threshold

   他のインポート方法とは異なり、INSERT操作ではフィルタしきい値（`max_filter_ratio`）を指定できません。デフォルトのフィルタしきい値は1で、これはエラーのある行を無視できることを意味します。

   データがフィルタされないことを要求するビジネスシナリオでは、[session variable](../../session/variable/SET-VARIABLE) `enable_insert_strict`を`true`に設定することで、データがフィルタされた場合に`INSERT`が正常に実行されないことを保証できます。

5. パフォーマンスの問題

   `VALUES`メソッドを使用した単一行挿入は行わないでください。この方法を使用する必要がある場合は、複数行のデータを1つのINSERT文にまとめて一括コミットしてください。
