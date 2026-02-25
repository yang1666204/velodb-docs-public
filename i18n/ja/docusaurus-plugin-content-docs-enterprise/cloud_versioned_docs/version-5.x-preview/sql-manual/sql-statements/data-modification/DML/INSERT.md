---
{
  "title": "I notice that the text you want me to translate appears to be just \"INSERT\" - which seems like a placeholder rather than the actual technical documentation you want translated.\n\nCould you please provide the actual English technical documentation text that you'd like me to translate into Japanese?",
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

> tablet_name: データをインポートする宛先テーブル。`db_name.table_name`の形式で指定できます
>
> partitions: インポートするパーティションを指定します。`table_name`に存在するパーティションである必要があります。複数のパーティション名はカンマで区切ります
>
> label: Insertタスクのラベルを指定します
>
> column_name: 指定された宛先カラム。`table_name`に存在するカラムである必要があります
>
> expression: カラムに割り当てる必要がある対応する式
>
> DEFAULT: 対応するカラムにデフォルト値を使用させます
>
> query: 一般的なクエリ。クエリの結果がターゲットに書き込まれます
>
> hint: `INSERT`の実行動作を示すために使用されるいくつかの指標。次の値から1つを選択できます：`/*+ STREAMING */`、`/*+ SHUFFLE */`、または`/*+ NOSHUFFLE */`
> 1. STREAMING: 現在、実用的な効果はなく、以前のバージョンとの互換性のためにのみ保持されています。（以前のバージョンでは、このヒントを追加するとラベルが返されましたが、現在はデフォルトでラベルを返します）
> 2. SHUFFLE: ターゲットテーブルがパーティションテーブルの場合、このヒントを有効にするとrepartiitonが実行されます。
> 3. NOSHUFFLE: ターゲットテーブルがパーティションテーブルであっても、repartiitonは実行されませんが、データが各パーティションに正しく配置されることを保証するために他の操作が実行されます。

merge-on-writeが有効になっているUniqueテーブルでは、insert文を使用して部分カラム更新を実行することもできます。insert文で部分カラム更新を実行するには、セッション変数enable_unique_key_partial_updateをtrueに設定する必要があります（この変数のデフォルト値はfalseで、デフォルトではinsert文による部分カラム更新は許可されません）。部分カラム更新を実行する場合、挿入されるカラムには少なくともすべてのKeyカラムが含まれている必要があり、更新したいカラムを指定する必要があります。挿入される行のKeyカラム値が元のテーブルに既に存在する場合、同じキーカラム値を持つ行のデータが更新されます。挿入される行のKeyカラム値が元のテーブルに存在しない場合、新しい行がテーブルに挿入されます。この場合、insert文で指定されていないカラムは、デフォルト値を持つかnull許可である必要があります。これらの欠落したカラムは、まずデフォルト値で埋められることが試行され、カラムにデフォルト値がない場合はnullで埋められます。カラムがnullにできない場合、insert操作は失敗します。

insert文が厳密モードで動作するかどうかを制御するセッション変数`enable_insert_strict`のデフォルト値はtrueであることに注意してください。つまり、insert文はデフォルトで厳密モードであり、このモードでは部分カラム更新において存在しないキーの更新は許可されません。したがって、insert文を部分カラム更新に使用し、存在しないキーを挿入したい場合は、`enable_unique_key_partial_update`をtrueに設定し、同時に`enable_insert_strict`をfalseに設定する必要があります。

注意:

`INSERT`文を実行する際、デフォルトの動作では、文字列が長すぎるなど、対象テーブル形式に適合しないデータをフィルタリングします。ただし、データをフィルタリングしないことが求められるビジネスシナリオでは、セッション変数`enable_insert_strict`を`true`に設定して、データがフィルタリングされた際に`INSERT`が正常に実行されないことを保証できます。

## 例

`test`テーブルには2つのカラム`c1`、`c2`が含まれています。

1. `test`テーブルに1行のデータをインポートします

```sql
INSERT INTO test VALUES (1, 2);
INSERT INTO test (c1, c2) VALUES (1, 2);
INSERT INTO test (c1, c2) VALUES (1, DEFAULT);
INSERT INTO test (c1) VALUES (1);
```
最初と2番目のステートメントは同じ効果を持ちます。ターゲット列が指定されていない場合、テーブル内の列の順序がデフォルトのターゲット列として使用されます。
3番目と4番目のステートメントは同じ意味を表し、`c2`列のデフォルト値を使用してデータインポートを完了します。

2. 複数行のデータを`test`テーブルに一度にインポートする

```sql
INSERT INTO test VALUES (1, 2), (3, 2 + 2);
INSERT INTO test (c1, c2) VALUES (1, 2), (3, 2 * 2);
INSERT INTO test (c1) VALUES (1), (3);
INSERT INTO test (c1, c2) VALUES (1, DEFAULT), (3, DEFAULT);
```
最初と2番目のステートメントは同じ効果を持ち、一度に2つのデータを`test`テーブルにインポートします
3番目と4番目のステートメントの効果は既知であり、`c2`列のデフォルト値を使用して2つのデータを`test`テーブルにインポートします

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

1. 戻り結果を確認する

   INSERT操作は同期操作であり、結果の返却は操作の終了を示します。ユーザーは異なる戻り結果に応じて対応する処理を実行する必要があります。

   1. 実行が成功し、結果セットが空の場合

      select文に対応するinsertの結果セットが空の場合、以下のように返却されます：

      ```sql
      mysql> insert into tbl1 select * from empty_tbl;
      Query OK, 0 rows affected (0.02 sec)
      ```
`Query OK`は実行が成功したことを示します。`0 rows affected`はデータがインポートされなかったことを意味します。

   2. 実行が成功し、結果セットが空ではない

      結果セットが空ではない場合。返される結果は以下の状況に分かれます：

      1. Insertが正常に実行され、可視である：

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
`label`はユーザーが指定したラベルまたは自動生成されたラベルです。LabelはこのInsert Into インポートジョブのIDです。各インポートジョブは単一データベース内で一意のLabelを持ちます。

         `status`はインポートされたデータが可視であるかどうかを示します。可視の場合は`visible`、可視でない場合は`committed`を表示します。

         `txnId`はこのinsertに対応するインポートトランザクションのidです。

         `err`フィールドはその他の予期しないエラーを表示します。

         フィルタリングされた行を表示する必要がある場合、ユーザーは以下のステートメントを渡すことができます

         ```sql
         show load where label="xxx";
         ```
返却された結果のURLは、間違ったデータをクエリするために使用される可能性があります。詳細については、後述の**Viewing Error Lines**の概要を参照してください。

         **データの不可視状態は一時的な状態であり、このバッチのデータは最終的に可視になります**

         このバッチのデータの可視状態は、次のステートメントで確認できます：

         ```sql
         show transaction where id=4005;
         ```
返された結果の`TransactionStatus`列が`visible`である場合、表現データは可視状態です。

   3. 実行失敗

      実行失敗は、データが正常にインポートされなかったことを示し、以下が返されます：

      ```sql
      mysql> insert into tbl1 select * from tbl2 where k1 = "a";
      ERROR 1064 (HY000): all partitions have no load data. url: http://10.74.167.16:8042/api/_load_error_log?file=__shard_2/error_log_insert_stmt_ba8bb9e158e4879-ae8de8507c0bf8a2_ba8bb9e158e4879_ae8de8507c0
      ```
`ERROR 1064 (HY000): all partitions have no load data`が失敗の理由を示しています。以下のurlを使用して誤ったデータをクエリできます：

      ```sql
      show load warnings on "url";
      ```
特定のエラー行を確認できます。

2. タイムアウト時間

   INSERT操作のタイムアウトは、max(insert_timeout, query_timeout)によって制御されます。両方とも環境変数であり、insert_timeoutのデフォルトは4時間、query_timeoutのデフォルトは5分です。操作がタイムアウトを超えた場合、ジョブはキャンセルされます。insert_timeoutの導入は、INSERT文がより長いデフォルトタイムアウトを持つことを保証し、通常のクエリに適用される短いデフォルトタイムアウトの影響を受けることなく、インポートタスクを実行できるようにするためです。

3. Labelと原子性

   INSERT操作はインポートの原子性も保証します。[Import Transactions and Atomicity](../../../../data-operate/transaction.md)のドキュメントを参照してください。

   インサート操作でクエリ部分として`CTE(Common Table Expressions)`を使用する場合、`WITH LABEL`と`column`部分を指定する必要があります。

4. Filter Threshold

   他のインポート方法とは異なり、INSERT操作ではfilter threshold（`max_filter_ratio`）を指定できません。デフォルトのfilter thresholdは1であり、これはエラーのある行を無視できることを意味します。

   データをフィルタリングしないことが要求されるビジネスシナリオでは、[session variable](../../session/variable/SET-VARIABLE)`enable_insert_strict`を`true`に設定して、データがフィルタリングされた場合に`INSERT`が正常に実行されないことを保証できます。

5. パフォーマンスの問題

   `VALUES`方法を使用した単一行の挿入はありません。この方法を使用する必要がある場合は、複数行のデータを1つのINSERT文にまとめて、一括コミットを行ってください。
