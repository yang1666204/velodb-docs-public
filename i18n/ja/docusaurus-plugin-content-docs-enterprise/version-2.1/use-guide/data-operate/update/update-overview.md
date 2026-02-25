---
{
  "title": "データ更新の概要",
  "description": "今日のデータドリブン意思決定の環境において、データの「freshness」は、企業が激しい競争の中で差別化を図るための中核的な競争優位性となっています",
  "language": "ja"
}
---
今日のデータ駆動型意思決定環境において、データの「鮮度」は、企業が激しい市場競争で差別化を図るための中核的な競争優位性となっています。従来のT+1データ処理モデルは、固有のレイテンシのため、現代のビジネスが求める厳格なリアルタイム要件を満たすことができません。ビジネスデータベースとデータウェアハウス間のミリ秒レベルの同期の実現、運用戦略の動的調整、または意思決定の精度を確保するための数秒以内でのエラーデータの修正など、堅牢なリアルタイムデータ更新機能は極めて重要です。

Apache Dorisは、現代のリアルタイム分析データベースとして、究極のデータ鮮度を提供することをコア設計目標の一つとしています。強力なデータモデルと柔軟な更新メカニズムを通じて、データ分析のレイテンシを日次や時間次から秒次まで圧縮することに成功し、ユーザーがリアルタイムで機敏なビジネス意思決定ループを構築するための堅固な基盤を提供しています。

本ドキュメントは、Apache Dorisのデータ更新機能を体系的に説明する公式ガイドとして、そのコア原理、多様な更新・削除方法、典型的なアプリケーションシナリオ、および異なるデプロイメントモードでのパフォーマンスベストプラクティスをカバーし、Dorisのデータ更新機能を包括的に習得し効率的に活用できるよう支援することを目的としています。

## 1. コアコンセプト: テーブルモデルと更新メカニズム

Dorisでは、データテーブルの**データモデル**がそのデータ組織と更新動作を決定します。さまざまなビジネスシナリオをサポートするため、DorisはUnique Key Model、Aggregate Key Model、Duplicate Key Modelの3つのテーブルモデルを提供しています。このうち、**Unique Key Modelが複雑で高頻度なデータ更新を実装するためのコア**となります。

### 1.1. テーブルモデル概要

| **テーブルモデル**                | **主な特徴**                                             | **更新機能**                        | **使用例**                                                |
| ------------------------------ | ------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| **Unique Key Model**           | リアルタイム更新用に構築。各データ行は一意のPrimary Keyで識別され、行レベルのUPSERT（Update/Insert）と部分列更新をサポート。 | 最も強力で、すべての更新・削除方法をサポート。 | 注文ステータスの更新、リアルタイムユーザータグ計算、CDCデータ同期、およびその他の頻繁なリアルタイム変更が必要なシナリオ。 |
| **Aggregate Key Model**        | 指定されたKey列に基づいてデータを事前集約。同じKeyを持つ行については、定義された集約関数（SUM、MAX、MIN、REPLACEなど）に従ってValue列がマージされる。 | 制限あり、Key列に基づくREPLACEスタイルの更新と削除をサポート。 | リアルタイムサマリー統計が必要なシナリオ（リアルタイムレポート、広告クリック統計など）。 |
| **Duplicate Key Model**        | データは追加専用の書き込みのみをサポートし、重複排除や集約操作は行わない。同一のデータ行でも保持される。 | 制限あり、DELETE文による条件付き削除のみをサポート。 | ログ収集、ユーザー行動追跡、およびその他の更新を必要とせず追加のみが必要なシナリオ。 |

### 1.2. データ更新方法

Dorisは2つの主要なデータ更新方法カテゴリを提供しています：**データロードによる更新**と**DML文による更新**。

#### 1.2.1. ロードによる更新（UPSERT）

これはDorisの**推奨する高性能・高並行性**更新方法で、主に**Unique Key Model**を対象としています。すべてのロード方法（Stream Load、Broker Load、Routine Load、`INSERT INTO`）は自然に`UPSERT`セマンティクスをサポートします。新しいデータがロードされる際、そのプライマリキーがすでに存在する場合、Dorisは古い行データを新しい行データで上書きします。プライマリキーが存在しない場合は、新しい行を挿入します。

![img](/images/update-overview/update-by-loading.png)

#### 1.2.2. `UPDATE` DML文による更新

Dorisは標準SQL `UPDATE`文をサポートし、ユーザーが`WHERE`句で指定された条件に基づいてデータを更新できます。この方法は非常に柔軟で、テーブル間結合更新などの複雑な更新ロジックをサポートします。

![img](/images/update-overview/update-self.png)

```sql
-- Simple update
UPDATE user_profiles SET age = age + 1 WHERE user_id = 1;

-- Cross-table join update
UPDATE sales_records t1
SET t1.user_name = t2.name
FROM user_profiles t2
WHERE t1.user_id = t2.user_id;
```
**注意**: `UPDATE`文の実行プロセスは、まず条件に一致するデータをスキャンし、その後更新されたデータをテーブルに書き戻すことを含みます。これは低頻度のバッチ更新タスクに適しています。**`UPDATE`文の高並行操作は推奨されません**。同じ主キーに関わる並行する`UPDATE`操作では、データ分離が保証されないためです。

#### 1.2.3. `INSERT INTO SELECT` DML文による更新

DorisはデフォルトでUPSERTセマンティクスを提供するため、`INSERT INTO SELECT`を使用することで`UPDATE`と同様の更新効果を実現することも可能です。

### 1.3. データ削除方法

更新と同様に、DorisはロードとDML文の両方でデータ削除をサポートしています。

#### 1.3.1. ロードによるマーク削除

これは効率的なバッチ削除方法で、主に**Unique Key Model**で使用されます。ユーザーはデータをロードする際に特別な隠しカラム`DORIS_DELETE_SIGN`を追加できます。ある行のこのカラムの値が`1`または`true`の場合、Dorisはその主キーに対応するデータ行を削除済みとしてマークします（delete signの原理については後で詳しく説明します）。

```Plain
// Stream Load load data, delete row with user_id = 2
// curl --location-trusted -u user:passwd -H "columns:user_id, __DORIS_DELETE_SIGN__" -T delete.json http://fe_host:8030/api/db_name/table_name/_stream_load

// delete.json content
[
    {"user_id": 2, "__DORIS_DELETE_SIGN__": "1"}
]
```
#### 1.3.2. `DELETE` DML文による削除

Dorisは標準SQL `DELETE`文をサポートし、`WHERE`条件に基づいてデータを削除できます。

- **Unique Key Model**: `DELETE`文は条件を満たす行のprimary keyを削除マークで書き換えます。そのため、パフォーマンスは削除するデータ量に比例します。Unique Key Modelでの`DELETE`文の実行原理は`UPDATE`文と非常に似ており、まずクエリを通じて削除するデータを読み取り、その後削除マークを付けて再度書き込みます。`UPDATE`文と比較して、DELETE文はKeyカラムと削除マークカラムのみを書き込む必要があるため、比較的軽量です。
- **Duplicate/Aggregate Models**: `DELETE`文はdelete predicateを記録することで実装されています。クエリ時に、このpredicateはランタイムフィルタとして機能し、削除されたデータをフィルタリングします。そのため、`DELETE`操作自体は非常に高速で、削除データ量にほぼ依存しません。ただし、**Duplicate/Aggregate Modelでの高頻度な** **`DELETE`** **操作は多数のランタイムフィルタを蓄積し、その後のクエリパフォーマンスに深刻な影響を与える**ことに注意してください。

```sql
DELETE FROM user_profiles WHERE last_login < '2022-01-01';
```
次の表では、削除のためのDML文の使用について簡単にまとめています：

|                    | **Unique Key Model** | **Aggregate Model**             | **Duplicate Model**  |
| ------------------ | -------------------- | ------------------------------- | -------------------- |
| Implementation     | Delete Sign          | Delete Predicate                | Delete Predicate     |
| Limitations        | None                 | Delete conditions only for Key columns | None                 |
| Deletion Performance | Moderate             | Fast                            | Fast                 |

## 2. Unique Key Modelの詳細：原理と実装

Unique Key ModelはDorisの高性能リアルタイム更新の基盤です。その内部動作原理を理解することは、そのパフォーマンスを最大限に活用するために重要です。

### 2.1. Merge-on-Write (MoW) vs. Merge-on-Read (MoR)

Unique Key Modelには2つのデータマージ戦略があります：Merge-on-Write (MoW)とMerge-on-Read (MoR)です。**Doris 2.1以降、MoWがデフォルトおよび推奨実装となっています**。

| **Feature**        | **Merge-on-Write (MoW)**                                     | **Merge-on-Read (MoR) - (Legacy)**                           |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Core Concept**   | データ書き込み中にデータの重複除去とマージを完了し、ストレージ内の各プライマリキーごとに最新レコードが1つだけ存在することを保証します。 | データ書き込み中は複数のバージョンを保持し、クエリ中にリアルタイムマージを実行して最新バージョンを返します。 |
| **Query Performance** | 極めて高い。クエリ中に追加のマージ操作が不要で、パフォーマンスは更新されていない詳細テーブルのパフォーマンスに近づきます。 | 劣る。クエリ中にデータマージが必要で、MoWより約3-10倍時間がかかり、より多くのCPUとメモリを消費します。 |
| **Write Performance** | 書き込み中にマージオーバーヘッドがあり、MoRと比較してパフォーマンスが多少低下します（小さなバッチで約10-20%、大きなバッチで30-50%）。 | 書き込み速度が高速で、詳細テーブルに近づきます。               |
| **Resource Consumption** | 書き込みとバックグラウンドCompaction中により多くのCPUとメモリを消費します。 | クエリ中により多くのCPUとメモリを消費します。                |
| **Use Cases**      | ほとんどのリアルタイム更新シナリオ。特に読み取り重視、書き込み軽量のビジネスに適しており、最高のクエリ分析パフォーマンスを提供します。 | 書き込み重視、読み取り軽量のシナリオに適していますが、もはや主流の推奨ではありません。 |

MoWメカニズムは書き込みフェーズでの小さなコストをクエリパフォーマンスの大幅な向上と交換し、OLAPシステムの「読み取り重視、書き込み軽量」という特性と完全に一致しています。

### 2.2. 条件付き更新（Sequence Column）

分散システムでは、順序が乱れたデータの到着は一般的な問題です。たとえば、注文ステータスが順次「支払済み」と「発送済み」に変更されるが、ネットワークの遅延により、「発送済み」を表すデータが「支払済み」を表すデータより先にDorisに到着する場合があります。

この問題を解決するために、Dorisは**Sequence Column**メカニズムを導入しています。ユーザーはテーブル作成時に列（通常はタイムスタンプまたはバージョン番号）をSequence列として指定できます。同じプライマリキーを持つデータを処理する際、DorisはそのSequence列の値を比較し、**常に最大のSequence値を持つ行を保持**し、データが順序よく到着しない場合でも最終的な整合性を確保します。

```sql
CREATE TABLE order_status (
    order_id BIGINT,
    status_name STRING,
    update_time DATETIME
)
UNIQUE KEY(order_id)
DISTRIBUTED BY HASH(order_id)
PROPERTIES (
    "function_column.sequence_col" = "update_time" -- Specify update_time as Sequence column
);

-- 1. Write "Shipped" record (larger update_time)
-- {"order_id": 1001, "status_name": "Shipped", "update_time": "2023-10-26 12:00:00"}

-- 2. Write "Paid" record (smaller update_time, arrives later)
-- {"order_id": 1001, "status_name": "Paid", "update_time": "2023-10-26 11:00:00"}

-- Final query result, retains record with largest update_time
-- order_id: 1001, status_name: "Shipped", update_time: "2023-10-26 12:00:00"
```
### 2.3. 削除機能（`DORIS_DELETE_SIGN`）ワークフロー

`DORIS_DELETE_SIGN`の動作原理は「論理的マーキング、バックグラウンドクリーンアップ」として要約できます。

1. **削除の実行**: ユーザーがloadまたは`DELETE`文を通じてデータを削除する際、Dorisは物理ファイルから即座にデータを削除しません。代わりに、削除対象のプライマリキーに対して新しいレコードを書き込み、`DORIS_DELETE_SIGN`列を`1`としてマークします。
2. **クエリフィルタリング**: ユーザーがデータをクエリする際、Dorisは自動的にクエリプランに`WHERE DORIS_DELETE_SIGN = 0`のフィルタ条件を追加し、削除マークされたすべてのデータをクエリ結果から隠します。
3. **バックグラウンドCompaction**: DorisのバックグラウンドCompactionプロセスは定期的にデータをスキャンします。通常のレコードと削除マークレコードの両方を持つプライマリキーを発見した際、マージプロセス中に両方のレコードを物理的に削除し、最終的にストレージ領域を解放します。

この機能により、削除操作に対する迅速な応答を保証すると同時に、バックグラウンドタスクを通じて物理的なクリーンアップを非同期で完了し、オンラインビジネスへのパフォーマンス影響を回避します。

以下の図は`DORIS_DELETE_SIGN`の動作方法を示しています：

![img](/images/update-overview/delete-sign-en.png)

### 2.4 部分列更新

バージョン2.0以降、DorisはUnique Key Models（MoW）で強力な部分列更新機能をサポートしています。データのロード時、ユーザーはプライマリキーと更新対象の列のみを提供する必要があり、提供されていない列は元の値を変更せずに維持します。これにより、ワイドテーブル結合やリアルタイムタグ更新などのシナリオにおけるETLプロセスが大幅に簡素化されます。

この機能を有効にするには、Unique Key Modelテーブル作成時にMerge-on-Write（MoW）モードを有効にし、`enable_unique_key_partial_update`プロパティを`true`に設定するか、データロード時に`"partial_columns"`パラメータを設定する必要があります。

```sql
CREATE TABLE user_profiles (
    user_id BIGINT,
    name STRING,
    age INT,
    last_login DATETIME
)
UNIQUE KEY(user_id)
DISTRIBUTED BY HASH(user_id)
PROPERTIES (
    "enable_unique_key_partial_update" = "true"
);

-- Initial data
-- user_id: 1, name: 'Alice', age: 30, last_login: '2023-10-01 10:00:00'

-- load partial update data through Stream Load, only updating age and last_login
-- {"user_id": 1, "age": 31, "last_login": "2023-10-26 18:00:00"}

-- Updated data
-- user_id: 1, name: 'Alice', age: 31, last_login: '2023-10-26 18:00:00'
```
**Partial Column Update Principle Overview**

従来のOLTPデータベースとは異なり、DorisのPartial Column Updateはインプレースデータ更新ではありません。Dorisでより良い書き込みスループットとクエリパフォーマンスを実現するため、Unique Key ModelのPartial Column Updateは**「ロード時の不足フィールド補完とそれに続く全行書き込み」**の実装アプローチを採用しています。

そのため、DorisのPartial Column Updateの使用には**「読み取り増幅」**と**「書き込み増幅」**効果があります。例えば、100列の幅広いテーブルで10個のフィールドを更新する場合、Dorisは書き込みプロセス中に不足している90個のフィールドを補完する必要があります。各フィールドが同様のサイズであると仮定すると、1MBの10フィールド更新により、Dorisシステムでは約9MBのデータ読み取り（不足フィールドの補完）と10MBのデータ書き込み（完全な行の新しいファイルへの書き込み）が発生し、約9倍の読み取り増幅と10倍の書き込み増幅になります。

**Partial Column Update Performance Recommendations**

Partial Column Updateにおける読み取りおよび書き込み増幅により、Dorisはカラムナーストレージシステムであるため、データ読み取りプロセスで大きなランダムI/Oが発生する可能性があり、ストレージに高いランダム読み取りIOPSが要求されます。従来のメカニカルディスクはランダムI/Oに大きなボトルネックがあるため、**高頻度書き込みでPartial Column Update機能を使用したい場合は、SSDドライブ、できればNVMeインターフェースが推奨されます**。これにより最適なランダムI/Oサポートが提供されます。

さらに、**テーブルが非常に幅広い場合は、ランダムI/Oを減らすためにrow storageの有効化も推奨されます**。row storageを有効にすると、DorisはカラムナーストレージとともにRow-basedデータの追加コピーを保存します。Row-basedデータは各行を連続して保存するため、単一のI/O操作で全行を読み取れます（カラムナーストレージでは全ての不足フィールドを読み取るためにN回のI/O操作が必要です。前述の100列の幅広いテーブルで10列を更新する例では、全フィールドを読み取るために1行あたり90回のI/O操作が必要です）。

## 3. 典型的なアプリケーションシナリオ

Dorisの強力なデータ更新機能により、様々な要求の厳しいリアルタイム分析シナリオを処理できます。

### 3.1. CDCリアルタイムデータ同期

Flink CDCなどのツールを通じて上流のビジネスデータベース（MySQL、PostgreSQL、Oracleなど）から変更データ（Binlog）をキャプチャし、Doris Unique Key Modelテーブルにリアルタイムで書き込むことは、リアルタイムデータウェアハウス構築における最も典型的なシナリオです。

- **Whole Database Synchronization**: Flink Doris ConnectorはFlink CDCを内部に統合しており、手動でのテーブル作成とフィールドマッピング設定なしに、上流データベースからDorisへの自動化されたエンドツーエンドWhole Database Synchronizationを可能にします。
- **一貫性の確保**: Unique Key Modelの`UPSERT`機能を利用して上流の`INSERT`および`UPDATE`操作を処理し、`DORIS_DELETE_SIGN`を使用して`DELETE`操作を処理し、Sequenceカラム（Binlogのタイムスタンプなど）と組み合わせて順序が乱れたデータを処理し、上流データベースの状態を完璧に複製してミリ秒レベルのデータ同期レイテンシを実現します。

![img](/images/update-overview/flink.png)

### 3.2. Real-time Wide Table Joining

多くの分析シナリオでは、異なるビジネスシステムからのデータをユーザーワイドテーブルや製品ワイドテーブルに結合する必要があります。従来のアプローチでは、オフラインETLタスク（SparkやHiveなど）を使用して定期的（T+1）な結合を行いますが、リアルタイム性能が悪く、メンテナンスコストが高くなります。代替として、Flinkをリアルタイムワイドテーブル結合計算に使用し、結合データをデータベースに書き込む方法は通常、大きな計算リソースを必要とします。

Dorisの**Partial Column Update**機能を使用することで、このプロセスを大幅に簡素化できます：

1. DorisでUnique Key Modelワイドテーブルを作成します。
2. 異なるソース（ユーザー基本情報、ユーザー行動データ、取引データなど）からのデータストリームを、Stream LoadまたはRoutine Loadを通じてこのワイドテーブルにリアルタイムで書き込みます。
3. 各データストリームは関連するフィールドのみを更新します。例えば、ユーザー行動データストリームは`page_view_count`、`last_login_time`などのフィールドのみを更新し、取引データストリームは`total_orders`、`total_amount`などのフィールドのみを更新します。

このアプローチは、ワイドテーブル構築をオフラインETLからリアルタイムストリーム処理に変換してデータの鮮度を大幅に向上させるだけでなく、変更されたカラムのみを書き込むことでI/Oオーバーヘッドを削減し、書き込みパフォーマンスを向上させます。

## 4. ベストプラクティス

これらのベストプラクティスに従うことで、Dorisのデータ更新機能をより安定的かつ効率的に使用できます。

1. **load更新を優先**: 高頻度、大容量の更新操作では、`UPDATE` DMLステートメントよりもStream LoadやRoutine Loadなどのloadメソッドを優先します。
2. **バッチ書き込み**: 個別の高頻度書き込み（> 100 TPSなど）に`INSERT INTO`ステートメントの使用は避けてください。各`INSERT`にはトランザクションオーバーヘッドが発生します。必要な場合は、Group Commit機能の有効化を検討して、複数の小さなバッチコミットを1つの大きなトランザクションにマージしてください。
3. **高頻度の** **`DELETE`** **は慎重に使用**: On DuplicateおよびAggregateモデルでは、クエリパフォーマンスの低下を防ぐため、高頻度の`DELETE`操作を避けてください。
4. **パーティションデータ削除には** **`TRUNCATE PARTITION`** **を使用**: パーティション全体のデータを削除する必要がある場合は、`TRUNCATE PARTITION`を使用してください。これは`DELETE`よりもはるかに効率的です。
5. **`UPDATE`** **を順次実行**: 同じデータ行に影響する可能性のある`UPDATE`タスクの並行実行は避けてください。

## まとめ

Apache Dorisは、Unique Key Modelを中心とした強力で柔軟かつ効率的なデータ更新機能により、従来のOLAPシステムのデータ鮮度におけるボトルネックを真に突破します。`UPSERT`やPartial Column Updateを実装する高パフォーマンスloadでも、Sequenceカラムを使用して順序が乱れたデータの一貫性を確保する場合でも、Dorisはエンドツーエンドリアルタイム分析アプリケーション構築のための完全なソリューションを提供します。

その核心原理を深く理解し、異なる更新メソッドの適用シナリオを習得し、このドキュメントで提供されるベストプラクティスに従うことで、Dorisの潜在能力を完全に解放し、リアルタイムデータを真にビジネス成長を推進する強力なエンジンにできるでしょう。
