---
{
  "title": "クエリサーキットブレーカー",
  "description": "クエリサーキットブレイキングは、長時間実行されるリソース消費の多いクエリがシステムに悪影響を与えることを防ぐために使用される保護メカニズムです...",
  "language": "ja"
}
---
# Query Circuit Breaker

Query circuit breakingは、長時間実行されるリソース消費の多いクエリがシステムに悪影響を与えることを防ぐ保護メカニズムです。クエリが事前定義されたリソースまたは時間の制限を超えた場合、circuit breakerメカニズムが自動的にクエリを終了し、システムパフォーマンス、リソース使用量、および他のクエリへの悪影響を回避します。このメカニズムは、マルチユーザー環境でクラスタの安定性を確保し、単一のクエリがシステムリソースを枯渇させたり応答を遅延させたりすることを防ぎ、全体的な可用性と効率を向上させます。

Dorisでは、2種類のcircuit breaker戦略があります：

- **Planning-time circuit breaking**、すなわち**SQL Block Rule**は、特定のパターンに一致するステートメントの実行を防ぐために使用されます。Block ruleは、DDLおよびDMLを含むあらゆるステートメントに適用されます。通常、block ruleはデータベース管理者（DBA）によってクラスタの安定性を向上させるために設定されます。例えば、

  - クエリが過度に多くのデータ行をスキャンすることを防ぐ
  - クエリが過度に多くのパーティションをスキャンすることを防ぐ
  - グローバル変数を変更するステートメントを防ぎ、クラスタ設定への誤った変更を回避する
  - 通常過度なリソースを消費するクエリパターンを防ぐ

- **Runtime circuit breaking**、すなわち**Workload Policy**は、実行時にクエリの実行時間、スキャンされるデータ量、メモリ消費をリアルタイムで監視し、ルールベースのquery circuit breakingを実装します。

## SQL Block Rule

ブロックパターンに応じて、以下に分類できます：

- Scan row count block rule
- Scan partition count block rule
- Scan bucket count block rule
- Query statement regex matching block rule
- Query statement hash value matching block rule

ブロックルールは、ブロックの範囲に応じて以下のように分類できます：

- グローバルレベルブロックルール
- ユーザーレベルブロックルール

### 使用方法

#### グローバルレベルブロックルール

```sql
CREATE SQL_BLOCK_RULE rule_001
PROPERTIES (
  "sql"="select \\* from t",
  "global" = "true",
  "enable" = "true"
)
```
この方法で、グローバルレベルのブロッキングルールを作成しました。このルールの名前は rule_001 です。クエリステートメントの正規表現マッチングルールが設定され、正規表現 `select \\* from t` にマッチするすべてのクエリステートメントをブロックします。

これはグローバルレベルのブロッキングルールであるため、上記の正規表現にマッチするステートメントを実行するユーザーはすべてブロックされます。例えば：

```sql
MySQL root@127.0.0.1:test> select * from t;
(1105, 'errCode = 2, detailMessage = errCode = 2, detailMessage = SQL match regex SQL block rule: rule_001')
```
#### ユーザーレベルのブロッキングルール

```sql
CREATE SQL_BLOCK_RULE rule_001
PROPERTIES (
  "sql"="select * from t",
  "global" = "false",
  "enable" = "true"
)
```
グローバルレベルのブロッキングルールとは異なり、ユーザーレベルのブロッキングルールは指定されたユーザーにのみ適用されます。ブロッキングルールを作成する際に、プロパティ"global"を"false"に設定します。すると、このブロッキングルールはユーザーレベルのブロッキングルールとして扱われます。

ユーザーレベルのブロッキングルールを有効にするには、このルールを使用する必要があるユーザーに対して、対応するプロパティを設定する必要もあります。例えば：

```sql
set property for 'root' 'SQL_block_rules' = 'rule_001';
```
したがって、上記の設定後、rootユーザーがクエリを実行すると、rule_001という名前のブロッキングルールが適用されます。

```sql
MySQL root@127.0.0.1:test> set property for 'root' 'SQL_block_rules' = '';
Query OK, 0 rows affected
Time: 0.018s
MySQL root@127.0.0.1:test> select * from t;
+----+----+
| id | c1 |
+----+----+
| 1  | 1  |
+----+----+

1 row in set
Time: 0.027s
MySQL root@127.0.0.1:test> set property for 'root' 'SQL_block_rules' = 'rule_001';
Query OK, 0 rows affected
Time: 0.008s
MySQL root@127.0.0.1:test> select * from t;
(1105, 'errCode = 2, detailMessage = errCode = 2, detailMessage = SQL match regex SQL block rule: rule_001')
```
- ユーザーに対して複数のユーザーレベルブロッキングルールを追加したい場合は、ルールリストにすべてのルール名をカンマで区切って記載してください。
- ユーザーのすべてのユーザーレベルブロッキングルールを削除したい場合は、ルールリストを空の文字列に設定してください。

#### その他の操作
ブロッキングルールを変更または削除する必要がある場合は、ブロッキングルールのSQLマニュアルを参照してください。

### 使用例
以下のシナリオで使用できます：

* 指定した行数を超えるスキャンをブロックする
* 指定したパーティション数を超えるスキャンをブロックする
* 指定したバケット数を超えるスキャンをブロックする
* 特定のパターンを持つクエリをブロックする

#### 指定した行数を超えるスキャンのブロック
データのスキャンはBEのIOおよびCPUリソースを大幅に消費します。そのため、不要なデータスキャンはクラスタの安定性に大きな課題をもたらします。日常的な使用では、`SELECT * FROM t`などの盲目的なフルTableスキャン操作がしばしば発生します。このようなクエリがクラスタに損害を与えることを防ぐため、単一のクエリが単一のTableでスキャンする行数の上限を設定できます。

```sql
CREATE SQL_BLOCK_RULE rule_card 
PROPERTIES
(
   "cardinality" = "1000",
   "global" = "true",
   "enable" = "true"
);
```
上記のルールが設定されている場合、単一のTableスキャンが1000行を超えると、クエリの実行が禁止されます。
スキャンされる行数の計算は実行フェーズではなく計画フェーズで行われることに注意してください。そのため、行数を計算する際は、partitionとbucketプルーニングのみが考慮され、他のフィルタリング条件がスキャンされる行数に与える影響は考慮されません。つまり、最悪のケースが考慮されます。そのため、実際にスキャンされる行数が設定値未満のクエリもブロックされる可能性があります。

#### 指定されたpartition数を超えるデータのスキャンを防ぐ
過度に多くのpartitionをスキャンすると、BEのCPU消費量が大幅に増加する可能性があります。さらに、クエリが外部Tableに対するものである場合、大幅なネットワークオーバーヘッドとメタデータ取得オーバーヘッドが発生する可能性が高くなります。日常の使用では、これはしばしばpartition列のフィルタリング条件を書き忘れたり、間違って書いたりすることが原因です。このようなクエリがクラスターに損害を与えることを防ぐため、単一Tableでの単一クエリがスキャンするpartition数に上限を設定できます。

```sql
CREATE SQL_BLOCK_RULE rule_part_num 
PROPERTIES
(
   "partition_num" = "30",
   "global" = "true",
   "enable" = "true"
);
```
上記のルールが設定されている場合、単一Tableに対してスキャンされるパーティション数が30を超えると、クエリの実行が禁止されます。
スキャンされるパーティション数の計算は実行フェーズではなく、プランニングフェーズで完了することに注意してください。そのため、不完全なパーティションプルーニングにより、より多くのパーティションが保持される場合があります。したがって、実際のスキャンされるパーティション数が設定値より少ないクエリもブロックされる可能性があります。

#### 過剰なBucket数を持つデータのスキャンを防ぐ
あまりにも多くのbucketをスキャンすると、BEのCPU消費量が大幅に増加する可能性があります。このようなクエリがクラスタに害を与えることを防ぐために、単一のクエリが単一Tableでスキャンできるパーティション数に上限を設定できます。

```sql
CREATE SQL_BLOCK_RULE rule_teblet_num 
PROPERTIES
(
   "tablet_num" = "200",
   "global" = "true",
   "enable" = "true"
);
```
上記のルールが設定されている場合、単一Tableでスキャンされるバケット数が200を超えると、クエリの実行が禁止されます。

スキャンされたバケット数の計算は、実行フェーズではなく計画フェーズで行われることに注意することが重要です。したがって、不完全なバケットプルーニングにより、より多くのパーティションが保持される可能性があります。その結果、実際のスキャンされたバケット数が設定値よりも少ないクエリもブロックされる場合があります。

#### 特定のパターンを持つクエリのブロック

高い計算複雑性や長い計画時間など、様々な理由で、特定のパターンを使用するクエリをブロックしたい場合があります。

例えば、`abs`関数をブロックする場合。この目的を達成するために、以下の正規表現ブロックルールを使用できます。

```sql
CREATE SQL_BLOCK_RULE rule_abs
PROPERTIES(
  "sql"="(?i)abs\\s*\\(.+\\)",
  "global"="true",
  "enable"="true"
);
```
上記の正規表現において：

- `(?i)` は大文字小文字を区別しないマッチングを示します。
- `abs` はブロック対象となる関数です。
- `\s*` は `abs` と左括弧の間に任意の量の空白文字が許可されることを意味します。
- `\(.+\)` は関数のパラメータにマッチします。

同様に、類似の方法を使用して `set global` をブロックして意図しない変数の変更を防いだり、`truncate table` をブロックして意図しないデータの削除を防ぐことができます。

### FAQ

#### Q: 正規表現ブロッキングルールはクラスターに副作用がありますか？
A: はい。正規表現マッチングは計算集約的です。複雑な正規表現や多すぎる正規表現ブロッキングルールを使用すると、FEのCPU負荷が大幅に増加する可能性があります。したがって、正規表現ブロッキングルールは慎重に追加してください。必要でない限り複雑な正規表現の使用は避けてください。

#### Q: ブロッキングルールを一時的に無効にできますか？
A: はい。ブロッキングルールの"enable"プロパティを"false"に設定して変更してください。

#### Q: ブロッキングルールの正規表現はどの標準を使用しますか？
A: ブロッキングルールの正規表現はJavaの正規表現構文を使用します。一般的な表現はSQL構文マニュアルを参照できます。完全なマニュアルは https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html で確認できます。

## Workload Policy

SQL Block Ruleは計画時のサーキットブレーキング設定ですが、計画時のコスト計算が不正確である可能性があり（特に非常に複雑なクエリでは正確な推定が困難）、ルールが効果的でなかったり偽陽性を引き起こす可能性があります。Workload Policyはこの制限に対処するため、クエリ実行中に特定のメトリクスをリアルタイムで監視し、実行時の状態が期待に合わないクエリをサーキットブレーキングすることを可能にします。これにより、予期しない大きなクエリが過度なリソースを消費してクラスターの安定性に影響を与えることを防ぎます。一般的な実行時監視メトリクスには以下が含まれます：

* クエリ実行時間
* BE当たりのスキャン行数
* BE当たりのスキャンバイト数
* BE当たりのメモリ使用量

### バージョン注記

Workload Policyを使用して大きなクエリのサーキットブレーキングを実装できます。

| SQL                | Supported |
|--------------------|-----------|
| select             | yes       |
| insert into select | yes       |
| insert into values | no        |
| stream load        | yes       |
| routine load       | yes       |
| backup             | no        |
| compaction         | no        |

### Workload Policyの作成
`CREATE WORKLOAD Policy` コマンドを使用してリソース管理ポリシーを作成します。

以下の例では、`test_cancel_Policy` という名前のPolicyを作成し、クラスター内で1000ms以上実行されているクエリをキャンセルします。現在のステータスは有効です。Workload Policyの作成には `admin_priv` 権限が必要です。

```sql
create workload policy test_cancel_Policy
Conditions(query_time > 1000)
Actions(cancel_query) 
properties('enabled'='true'); 
```
Workload Policyを作成する際は、以下を指定する必要があります：

- **Condition**はポリシーのトリガー条件を表します。複数のConditionはカンマ「,」を使用してリンクし、「AND」関係を表すことができます。上記の例では、`query_time > 1000`はクエリ時間が1秒を超えた場合にPolicyがトリガーされることを示しています。現在サポートされているConditionは以下の通りです：

| Conditions            | デスクリプション                                                                                                 |
|-----------------------|-------------------------------------------------------------------------------------------------------------|
| username              | クエリが持つユーザー名で、FEの`set_session_variable` Actionのみをトリガーします。                   |
| be_scan_rows          | 単一のBEプロセスでSQLがスキャンした行数。SQLがBE上で並行実行される場合は、複数の並行実行の累積値となります。 |
| be_scan_bytes         | 単一のBEプロセスでSQLがスキャンしたバイト数。SQLがBE上で並行実行される場合は、複数の並行実行の累積値となります。単位はバイトです。 |
| query_time            | 単一のBEプロセスでのSQLの実行時間。単位はミリ秒です。                                             |
| query_be_memory_bytes | 単一のBEプロセスでのSQLのメモリ使用量。SQLがBE上で並行実行される場合は、複数の並行実行の累積値となります。単位はバイトです。 |

- **Action**は条件がトリガーされた際に実行されるアクションを表します。現在、Policyは1つのActionのみ定義できます（`set_session_variable`を除く）。上記の例では、`cancel_query`はクエリをキャンセルすることを示しています。現在サポートされているActionは以下の通りです：

| Actions                | デスクリプション                                                                                                      |
|------------------------|------------------------------------------------------------------------------------------------------------------|
| cancel_query           | クエリをキャンセルします。                                                                                                 |
| set_session_variable   | `set session variable`文をトリガーします。単一のpolicyは複数の`set_session_variable`オプションを持つことができ、現在は`username` ConditionによってFEでのみトリガーされます。 |

- **Properties**は現在のPolicyの属性を定義し、有効かどうかや優先度が含まれます。

| Properties      | デスクリプション                                                                                                                                                 |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| enabled         | `true`または`false`を指定可能で、デフォルトは`true`でPolicyが有効であることを示します。`false`はPolicyが無効であることを示します。                                      |
| priority        | 0から100の整数で、デフォルトは0、Policyの優先度を表します。値が高いほど優先度が高くなります。この属性は主に、クエリが複数のPolicyにマッチした場合に、最も高い優先度のPolicyのみが選択されることを保証します。 |
| workload_group  | 現在、Policyは1つのworkload groupにバインドでき、このPolicyが特定のWorkload Groupからのクエリにのみ適用されることを意味します。デフォルトは空で、すべてのクエリに適用されることを意味します。 |

### Workload PolicyをWorkload Groupにバインドする

デフォルトでは、Workload Policyはサポートされているすべてのクエリに適用されます。Policyが特定のWorkload Groupのみを対象とするよう指定したい場合は、`workload_group`オプションを通じてWorkload Groupをバインドする必要があります。文は以下の通りです：

```sql
create workload policy test_cancel_big_query
Conditions(query_time > 1000)
Actions(cancel_query) 
properties('workload_group'='normal')
```
### 重要な注意事項
- 同一Policy内のConditionsとActionsは、どちらもFEであるかどちらもBEである必要があります。例えば、`set_session_variable`と`cancel_query`は同一Policy内で設定できません。Conditions `be_scan_rows`と`username`は同一Policy内で設定できません。
- 現在、Policyは固定時間間隔で非同期スレッドによって実行されるため、ポリシー実行に一定の遅延が発生します。例えば、スキャン行数が1,000,000を超えた場合にクエリをキャンセルするポリシーをユーザーが設定し、その時点でクラスターリソースが比較的アイドル状態の場合、キャンセルポリシーが有効になる前にクエリが完了する可能性があります。現在の間隔は500msであり、この間隔より短い実行時間のクエリはポリシーチェックを回避する可能性があります。
- 現在サポートされているロードタイプには、select/insert、select/stream load、broker load、およびroutine loadが含まれます。
- 単一のクエリは複数のPolicyにマッチする可能性がありますが、最も高い優先度を持つPolicyのみが有効になります。
- ActionsとConditionsの変更は現在サポートされていません。削除して再作成することによってのみ変更できます。

### Workload Policy実演

#### 1. セッション変数変更テスト
Adminアカウントのセッション変数で並行性関連パラメータの変更を試行します。

```sql
-- log on admin to check variables
show variables like '%parallel_fragment_exec_instance_num%';
+-------------------------------------+-------+---------------+---------+
| Variable_name                       | Value | Default_Value | Changed |
+-------------------------------------+-------+---------------+---------+
| parallel_fragment_exec_instance_num | 8     | 8             | 0       |
+-------------------------------------+-------+---------------+---------+
1 row in set (0.00 sec)

-- Create a Policy to modify the concurrency parameters of the admin account.
create workload Policy test_set_var_Policy
Conditions(username='admin')
Actions(set_session_variable 'parallel_fragment_exec_instance_num=1') 

-- After some time, check the admin account's parameters again.
show variables like '%parallel_fragment_exec_instance_num%';
+-------------------------------------+-------+---------------+---------+
| Variable_name                       | Value | Default_Value | Changed |
+-------------------------------------+-------+---------------+---------+
| parallel_fragment_exec_instance_num | 1     | 8             | 1       |
+-------------------------------------+-------+---------------+---------+
1 row in set (0.01 sec)
```
#### 2. Big Query Circuit Breaker Test
3秒以上実行されるクエリをサーキットブレーカーで停止するテスト。以下は、ckbenchのq29の正常実行の監査ログで、このSQLが完了までに4.5秒かかったことを示している。

```sql
mySQL [hits]>SELECT REGEXP_REPLACE(Referer, '^https?://(?:www\.)?([^/]+)/.*$', '\1') AS k, AVG(length(Referer)) AS l, COUNT(*) AS c, MIN(Referer) FROM hits WHERE Referer <> '' GROUP BY k HAVING COUNT(*) > 100000 ORDER BY l DESC LIMIT 25;
+-----------------------------------------------------------------------+------------------+----------+---------------------------------------------------------------------------------------------------------------------+
| k                                                                     | l                | c        | min(Referer)                                                                                                        |
+-----------------------------------------------------------------------+------------------+----------+---------------------------------------------------------------------------------------------------------------------+
| 1                                                                     | 85.4611926713085 | 67259319 | http://%26ad%3D1%25EA%25D0%26utm_source=web&cd=19590&input_onlist/би-2 место будущей кондицин                       |
| http:%2F%2Fwwww.regnancies/search&evL8gE&where=all&filmId=bEmYZc_WTDE |               69 |   207347 | http:%2F%2Fwwww.regnancies/search&evL8gE&where=all&filmId=bEmYZc_WTDE                                               |
| http://новострашная                                                   |               31 |   740277 | http://новострашная                                                                                                 |
| http://loveche.html?ctid                                              |               24 |   144901 | http://loveche.html?ctid                                                                                            |
| http://rukodeliveresult                                               |               23 |   226135 | http://rukodeliveresult                                                                                             |
| http://holodilnik.ru                                                  |               20 |   133893 | http://holodilnik.ru                                                                                                |
| http://smeshariki.ru                                                  |               20 |   210736 | http://smeshariki.ru                                                                                                |
| http:%2F%2Fviewtopic                                                  |               20 |   391115 | http:%2F%2Fviewtopic                                                                                                |
| http:%2F%2Fwwww.ukr                                                   |               19 |   655178 | http:%2F%2Fwwww.ukr                                                                                                 |
| http:%2F%2FviewType                                                   |               19 |   148907 | http:%2F%2FviewType                                                                                                 |
| http://state=2008                                                     |               17 |   139630 | http://state=2008                                                                                                   |
+-----------------------------------------------------------------------+------------------+----------+---------------------------------------------------------------------------------------------------------------------+
11 rows in set (4.50 sec)
```
3秒を超えて実行されるクエリをキャンセルするPolicyを作成します。

```sql
create workload Policy test_cancel_3s_query
Conditions(query_time > 3000)
Actions(cancel_query) 
```
SQLを再実行すると、SQL実行が直接エラーを報告することが確認できます。

```sql
mySQL [hits]>SELECT REGEXP_REPLACE(Referer, '^https?://(?:www\.)?([^/]+)/.*$', '\1') AS k, AVG(length(Referer)) AS l, COUNT(*) AS c, MIN(Referer) FROM hits WHERE Referer <> '' GROUP BY k HAVING COUNT(*) > 100000 ORDER BY l DESC LIMIT 25;
ERROR 1105 (HY000): errCode = 2, detailMessage = (127.0.0.1)[CANCELLED]query cancelled by workload Policy,id:12345
```
