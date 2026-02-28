---
{
  "title": "VARIANT",
  "description": "Doris 2.1で新しいデータ型VARIANTを導入しました。これは半構造化JSONデータを格納できます。",
  "language": "ja"
}
---
## VARIANT

### 説明

Doris 2.1では、半構造化JSONデータを格納できる新しいデータ型VARIANTを導入しました。これにより、事前にTable構造で特定のカラムを定義することなく、異なるデータ型（整数、文字列、ブール値など）を含む複雑なデータ構造を格納できます。VARIANTタイプは、いつでも変更される可能性がある複雑なネストした構造を処理するのに特に有用です。書き込みプロセス中に、このタイプはカラムの構造と型に基づいてカラム情報を自動的に推論し、書き込まれたスキーマを動的にマージします。JSONキーとそれに対応する値をカラムと動的サブカラムとして格納します。

### 注記

JSON Typeに対する利点：

1. 異なる格納方法：JSON型はバイナリJSONB形式で格納され、JSON全体がsegmentファイルに行ごとに格納されます。一方、VARIANT型は書き込み時に型を推論し、書き込まれたJSONカラムを格納します。JSON型と比較して高い圧縮率を持ち、より良いストレージ効率を提供します。
2. クエリ：クエリは解析を必要としません。VARIANTはDorisのカラムナストレージ、ベクトル化エンジン、オプティマイザ、その他のコンポーネントを完全に活用し、ユーザーに非常に高いクエリ性能を提供します。
以下はclickbenchデータに基づくテスト結果です：

|    | ストレージ容量 |
|--------------|------------|
| 事前定義された静的カラム | 12.618 GB  |
| VARIANT タイプ    | 12.718 GB  |
| JSON タイプ             | 35.711 GB   |

**約65%のストレージ容量を節約**

| クエリ回数        | 事前定義された静的カラム | VARIANT タイプ | JSON タイプ        |
|---------------------|---------------------------|--------------|-----------------|
| 初回クエリ（コールド）  | 233.79s                   | 248.66s        | **ほとんどのクエリがタイムアウト**  |
| 2回目クエリ（ホット） | 86.02s                     | 94.82s          | 789.24s         |
| 3回目クエリ（ホット）   | 83.03s                     | 92.29s          | 743.69s         |

[test case](https://github.com/ClickHouse/ClickBench/blob/main/doris/queries.sql)は43のクエリを含みます

**8倍高速なクエリ、静的カラムに匹敵するクエリ性能**

### 例

Table作成、データインポート、クエリサイクルを含む例でVARIANTの機能と使用方法を実演します。

**Table作成構文**
構文で`VARIANT`キーワードを使用してTableを作成します。

``` sql
-- Without index
CREATE TABLE IF NOT EXISTS ${table_name} (
    k BIGINT,
    v VARIANT
)
table_properties;

-- Create an index on the v column, optionally specify the tokenize method, default is untokenized 
CREATE TABLE IF NOT EXISTS ${table_name} (
    k BIGINT,
    v VARIANT,
    INDEX idx_var(v) USING INVERTED [PROPERTIES("parser" = "english|unicode|chinese")] [COMMENT 'your comment']
)
table_properties;

-- Create an bloom filter on v column, to enhance query seed on sub columns
CREATE TABLE IF NOT EXISTS ${table_name} (
    k BIGINT,
    v VARIANT
)
...
properties("replication_num" = "1", "bloom_filter_columns" = "v");

```
**Query Syntax**

``` sql
-- use v['a']['b'] format for example, v['properties']['title'] type is VARIANT
SELECT v['properties']['title'] from ${table_name}

```
**GitHub eventsデータセットに基づく例**

ここでは、github eventsデータを使用して、VARIANTを使ったTable作成、データインポート、およびクエリを実演します。
以下はフォーマットされたデータの行です：

``` json
{
  "id": "14186154924",
  "type": "PushEvent",
  "actor": {
    "id": 282080,
    "login": "brianchandotcom",
    "display_login": "brianchandotcom",
    "gravatar_id": "",
    "url": "https://api.github.com/users/brianchandotcom",
    "avatar_url": "https://avatars.githubusercontent.com/u/282080?"
  },
  "repo": {
    "id": 1920851,
    "name": "brianchandotcom/liferay-portal",
    "url": "https://api.github.com/repos/brianchandotcom/liferay-portal"
  },
  "payload": {
    "push_id": 6027092734,
    "size": 4,
    "distinct_size": 4,
    "ref": "refs/heads/master",
    "head": "91edd3c8c98c214155191feb852831ec535580ba",
    "before": "abb58cc0db673a0bd5190000d2ff9c53bb51d04d",
    "commits": [""]
  },
  "public": true,
  "created_at": "2020-11-13T18:00:00Z"
}
```
**Table作成**

- VARIANT型の3つのカラムを作成：`actor`、`repo`、および`payload`。
- Table作成と同時に、`payload`カラム用の転置インデックス`idx_payload`を作成。
- `USING INVERTED`を使用してインデックスタイプを転置として指定し、サブカラムの条件フィルタリングを高速化することを目的とした。
- `PROPERTIES("parser" = "english")`により、英語のトークン化の採用を指定。

``` sql
CREATE DATABASE test_variant;
USE test_variant;
CREATE TABLE IF NOT EXISTS github_events (
    id BIGINT NOT NULL,
    type VARCHAR(30) NULL,
    actor VARIANT NULL,
    repo VARIANT NULL,
    payload VARIANT NULL,
    public BOOLEAN NULL,
    created_at DATETIME NULL,
    INDEX idx_payload (`payload`) USING INVERTED PROPERTIES("parser" = "english") COMMENT 'inverted index for payload'
)
DUPLICATE KEY(`id`)
DISTRIBUTED BY HASH(id) BUCKETS 10
properties("replication_num" = "1");
```
:::tip

1. payloadに多数のサブカラムがある場合など、VARIANTカラムにインデックスを作成すると、インデックスカラム数が過剰になり、書き込み性能に影響を与える可能性があります。
2. 同じVARIANTカラムのトークン化プロパティは均一です。多様なトークン化要件がある場合は、複数のVARIANTカラムを作成し、それぞれに対してインデックスプロパティを個別に指定することを検討してください。

:::


**インポートでのStreamloadの使用**

1時間分のGitHubイベントデータを含むgh_2022-11-07-3.jsonをインポートします。

``` shell
wget https://qa-build.oss-cn-beijing.aliyuncs.com/regression/variant/gh_2022-11-07-3.json

curl --location-trusted -u root:  -T gh_2022-11-07-3.json -H "read_json_by_line:true" -H "format:json"  http://127.0.0.1:18148/api/test_variant/github_events/_strea
m_load

{
    "TxnId": 2,
    "Label": "086fd46a-20e6-4487-becc-9b6ca80281bf",
    "Comment": "",
    "TwoPhaseCommit": "false",
    "Status": "Success",
    "Message": "OK",
    "NumberTotalRows": 139325,
    "NumberLoadedRows": 139325,
    "NumberFilteredRows": 0,
    "NumberUnselectedRows": 0,
    "LoadBytes": 633782875,
    "LoadTimeMs": 7870,
    "BeginTxnTimeMs": 19,
    "StreamLoadPutTimeMs": 162,
    "ReadDataTimeMs": 2416,
    "WriteDataTimeMs": 7634,
    "CommitAndPublishTimeMs": 55
}
```
インポートが正常に完了したことを確認してください。

``` sql
-- View the number of rows.
mysql> select count() from github_events;
+----------+
| count(*) |
+----------+
|   139325 |
+----------+
1 row in set (0.25 sec)

-- Random select one row
mysql> select * from github_events limit 1;
+-------------+-----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------+---------------------+
| id          | type      | actor                                                                                                                                                                                                                       | repo                                                                                                                                                     | payload                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | public | created_at          |
+-------------+-----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------+---------------------+
| 25061821748 | PushEvent | {"gravatar_id":"","display_login":"jfrog-pipelie-intg","url":"https://api.github.com/users/jfrog-pipelie-intg","id":98024358,"login":"jfrog-pipelie-intg","avatar_url":"https://avatars.githubusercontent.com/u/98024358?"} | {"url":"https://api.github.com/repos/jfrog-pipelie-intg/jfinte2e_1667789956723_16","id":562683829,"name":"jfrog-pipelie-intg/jfinte2e_1667789956723_16"} | {"commits":[{"sha":"334433de436baa198024ef9f55f0647721bcd750","author":{"email":"98024358+jfrog-pipelie-intg@users.noreply.github.com","name":"jfrog-pipelie-intg"},"message":"commit message 10238493157623136117","distinct":true,"url":"https://api.github.com/repos/jfrog-pipelie-intg/jfinte2e_1667789956723_16/commits/334433de436baa198024ef9f55f0647721bcd750"}],"before":"f84a26792f44d54305ddd41b7e3a79d25b1a9568","head":"334433de436baa198024ef9f55f0647721bcd750","size":1,"push_id":11572649828,"ref":"refs/heads/test-notification-sent-branch-10238493157623136113","distinct_size":1} |      1 | 2022-11-07 11:00:00 |
+-------------+-----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------+---------------------+
1 row in set (0.23 sec)
```
desc コマンドを実行してスキーマ情報を表示する際、サブカラムはストレージレイヤーで自動的に展開され、型推論が行われます。

``` sql
mysql> desc github_events;
+------------------------------------------------------------+------------+------+-------+---------+-------+
| Field                                                      | タイプ       | Null | Key   | Default | Extra |
+------------------------------------------------------------+------------+------+-------+---------+-------+
| id                                                         | BIGINT     | No   | true  | NULL    |       |
| type                                                       | VARCHAR(*) | Yes  | false | NULL    | NONE  |
| actor                                                      | VARIANT    | Yes  | false | NULL    | NONE  |
| created_at                                                 | DATETIME   | Yes  | false | NULL    | NONE  |
| payload                                                    | VARIANT    | Yes  | false | NULL    | NONE  |
| public                                                     | BOOLEAN    | Yes  | false | NULL    | NONE  |
+------------------------------------------------------------+------------+------+-------+---------+-------+
6 rows in set (0.07 sec)

mysql> set describe_extend_variant_column = true;
Query OK, 0 rows affected (0.01 sec)

mysql> desc github_events;
+------------------------------------------------------------+------------+------+-------+---------+-------+
| Field                                                      | タイプ       | Null | Key   | Default | Extra |
+------------------------------------------------------------+------------+------+-------+---------+-------+
| id                                                         | BIGINT     | No   | true  | NULL    |       |
| type                                                       | VARCHAR(*) | Yes  | false | NULL    | NONE  |
| actor                                                      | VARIANT    | Yes  | false | NULL    | NONE  |
| actor.avatar_url                                           | TEXT       | Yes  | false | NULL    | NONE  |
| actor.display_login                                        | TEXT       | Yes  | false | NULL    | NONE  |
| actor.id                                                   | INT        | Yes  | false | NULL    | NONE  |
| actor.login                                                | TEXT       | Yes  | false | NULL    | NONE  |
| actor.url                                                  | TEXT       | Yes  | false | NULL    | NONE  |
| created_at                                                 | DATETIME   | Yes  | false | NULL    | NONE  |
| payload                                                    | VARIANT    | Yes  | false | NULL    | NONE  |
| payload.action                                             | TEXT       | Yes  | false | NULL    | NONE  |
| payload.before                                             | TEXT       | Yes  | false | NULL    | NONE  |
| payload.comment.author_association                         | TEXT       | Yes  | false | NULL    | NONE  |
| payload.comment.body                                       | TEXT       | Yes  | false | NULL    | NONE  |
....
+------------------------------------------------------------+------------+------+-------+---------+-------+
406 rows in set (0.07 sec)
```
DESCは特定のパーティションを指定してスキーマを表示するために使用できます。構文は以下の通りです：

``` sql
DESCRIBE ${table_name} PARTITION ($partition_name);
```
**Querying**

:::tip

サブカラムに対してフィルタリングや集計機能を使用してクエリを実行する際は、サブカラムに対して追加のキャスト操作を行う必要があります（ストレージタイプが必ずしも固定されておらず、統一されたSQLタイプが必要なため）。
例：`SELECT * FROM tbl where CAST(var['titile'] as text) MATCH "hello world"`
以下の簡略化された例では、VARIANTをクエリに使用する方法を示しています：
以下は3つの典型的なクエリシナリオです

:::

1. `github_events`Tableからスターカウントに基づいて上位5つのリポジトリを取得します。

``` sql
mysql> SELECT
    ->     cast(repo['name'] as text) as repo_name, count() AS stars
    -> FROM github_events
    -> WHERE type = 'WatchEvent'
    -> GROUP BY repo_name
    -> ORDER BY stars DESC LIMIT 5;
+--------------------------+-------+
| repo_name                | stars |
+--------------------------+-------+
| aplus-framework/app      |    78 |
| lensterxyz/lenster       |    77 |
| aplus-framework/database |    46 |
| stashapp/stash           |    42 |
| aplus-framework/image    |    34 |
+--------------------------+-------+
5 rows in set (0.03 sec)
```
2. "doris"を含むコメントの件数を取得する。

``` sql
-- implicit cast `payload['comment']['body']` to string type
mysql> SELECT
    ->     count() FROM github_events
    ->     WHERE payload['comment']['body'] MATCH 'doris';
+---------+
| count() |
+---------+
|       3 |
+---------+
1 row in set (0.04 sec)
```
3. コメント数が最も多いissue番号とその対応するリポジトリを照会する。

``` sql
mysql> SELECT 
    ->   cast(repo['name'] as string) as repo_name, 
    ->   cast(payload['issue']['number'] as int) as issue_number, 
    ->   count() AS comments, 
    ->   count(
    ->     distinct cast(actor['login'] as string)
    ->   ) AS authors 
    -> FROM  github_events 
    -> WHERE type = 'IssueCommentEvent' AND (cast(payload["action"] as string) = 'created') AND (cast(payload["issue"]["number"] as int) > 10) 
    -> GROUP BY repo_name, issue_number 
    -> HAVING authors >= 4
    -> ORDER BY comments DESC, repo_name 
    -> LIMIT 50;
+--------------------------------------+--------------+----------+---------+
| repo_name                            | issue_number | comments | authors |
+--------------------------------------+--------------+----------+---------+
| facebook/react-native                |        35228 |        5 |       4 |
| swsnu/swppfall2022-team4             |           27 |        5 |       4 |
| belgattitude/nextjs-monorepo-example |         2865 |        4 |       4 |
+--------------------------------------+--------------+----------+---------+
3 rows in set (0.03 sec)
```
### 使用制限とベストプラクティス

**VARIANT型を使用する際にはいくつかの制限があります:**
VARIANTの動的カラムは、事前定義された静的カラムとほぼ同等の効率を持ちます。ログのように、フィールドが動的に追加されることが多いデータ（Kubernetesのコンテナラベルなど）を扱う際、JSONの解析と型推論により、書き込み操作中に追加のコストが発生する可能性があります。そのため、単一のインポートでのカラム数は1000未満に抑えることを推奨します。

可能な限り型の一貫性を保つようにしてください。Dorisは自動的に互換性のある型変換を実行します。フィールドが互換性のある型変換を行えない場合、一律でJSONB型に変換されます。JSONBカラムのパフォーマンスは、intやtextなどのカラムと比較して低下する可能性があります。

1. tinyint -> smallint -> int -> bigint、整数型は矢印の方向に従って昇格可能です。
2. float -> double、浮動小数点数は矢印の方向に従って昇格可能です。
3. text、文字列型。
4. JSON、バイナリJSON型。

上記の型が互換性を持てない場合、型情報の損失を防ぐためにJSON型に変換されます。VARIANTで厳密なスキーマを設定する必要がある場合、VARIANT MAPPINGメカニズムが間もなく導入される予定です。

**その他の制限には以下が含まれます:**

- VARIANTカラムは、クエリを高速化するために転置インデックスまたはbloom filterのみ作成できます。
- より高い書き込みパフォーマンスを得るには、**RANDOM**モードまたはgroup commitモードの使用を推奨します。
- dateやdecimalなどの非標準JSON型は、これらの型がtext型に推論されるため、より良いパフォーマンスのために理想的には静的型を使用すべきです。
- 2次元以上の配列はJSONBエンコーディングで保存され、ネイティブ配列よりもパフォーマンスが劣る可能性があります。
- プライマリキーまたはソートキーとしてはサポートされていません。
- フィルターや集約を使用するクエリにはキャストが必要です。ストレージレイヤーは、ストレージ型とキャストのターゲット型に基づいてキャスト操作を排除し、クエリを高速化します。
- VARIANTカラムの読み取りには、本質的にすべてのサブフィールドのスキャンが含まれます。カラムに多数のサブフィールドが含まれている場合、これにより大幅なスキャンオーバーヘッドが生じ、クエリパフォーマンスに悪影響を与える可能性があります。カラム全体を取得する必要がある場合のパフォーマンスを最適化するには、生のJSON文字列を保存するためのSTRINGまたはJSONB型の追加カラムを追加することを検討してください。例:

``` sql
-- Lead to scan all subfields of data_variant
CREATE TABLE example_table (
  id INT,
  data_variant VARIANT,
);
SELECT * FROM example_table WHERE data_variant LIKE '%doris%'

-- Better performance for `LIKE`
CREATE TABLE example_table (
  id INT,
  data_variant VARIANT,
  data_string STRING
);
SELECT * FROM example_table WHERE data_string LIKE '%doris%'
```
**Column-Count制限のチューニング技法:**

注意: サブカラム数が5,000を超える場合、メモリと設定により高い要件が適用されます。単一マシンでは、最低128 GBのRAMと32 CPUコアを目標としてください。

1. BE設定で、`variant_max_merged_tablet_schema_size=n`を調整します。nは実際のカラム数より大きくする必要があります（10,000を超えることは推奨されません）。

2. 多数のカラムを抽出すると、compactionに大きな負荷がかかることに注意してください（インポートスループットはそれに応じてスロットルする必要があります）。メモリ使用量に基づいてクライアント側インポートの`batch_size`を増加させることで、compaction中の書き込み増幅を削減できます。または、`group_commit`（Tableプロパティ）を有効にし、`group_commit_interval_ms`と`group_commit_data_bytes`を適切に増加させることも可能です。

3. クエリでbucket pruningが不要な場合は、random bucketingを使用し、load_to_single_tabletインポート設定（インポート設定）を有効にして、compaction書き込み増幅を削減してください。

4. BE設定で、インポート負荷に応じて`max_cumu_compaction_threads`を調整します。最低8スレッドを確保してください。

5. BE設定で、`vertical_compaction_num_columns_per_group=500`を設定してgrouped-compaction効率を向上させますが、これによりメモリオーバーヘッドが増加します。

6. BE設定で、`segment_cache_memory_percentage=20`を設定してsegment cacheキャパシティを増加させ、メタデータキャッシュ効率を向上させます。

7. コンパクション Scoreを密にモニターしてください。スコアが継続的に上昇している場合、compactionが追いついていないことを示します（インポート負荷をそれに応じて削減する必要があります）。

8. `SELECT *`や`SELECT variant`を使用すると、クラスター全体の負荷が大幅に増加し、タイムアウトやout-of-memoryエラーが発生する可能性があります。クエリにパス情報を含めることが推奨されます。例：`SELECT variant['path_1']`。

### FAQ

1. Streamload Error: [CANCELLED][INTERNAL_ERROR] tablet error: [DATA_QUALITY_ERROR] Reached max column size limit 2048.

compactionとメタデータストレージの制限により、VARIANT型はカラム数に制限を課しており、デフォルトは2048カラムです。BE設定`variant_max_merged_tablet_schema_size`をそれに応じて調整できますが、4096カラムを超えることは推奨されません（より高性能なハードウェアが必要です）。

2. VARIANT型のnull（例：`{"key": null}`）とSQL NULL（つまり、IS NULL）に違いはありますか？

いいえ、違いはありません。VARIANT型では、これらは同等として扱われます。

### Keywords

    VARIANT
