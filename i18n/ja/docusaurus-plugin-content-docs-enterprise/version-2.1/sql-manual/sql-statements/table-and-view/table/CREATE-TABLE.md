---
{
  "title": "CREATE TABLE",
  "description": "現在のデータベースまたは指定されたデータベースに新しいTableを作成します。Tableは複数の列を持つことができ、各列の定義には名前、データ型、",
  "language": "ja"
}
---
## 説明

現在のデータベースまたは指定されたデータベースに新しいTableを作成します。Tableは複数の列を持つことができ、各列の定義には名前、データ型、およびオプションで以下の属性が含まれます：

- キーかどうか
- 集約セマンティクスを持つかどうか
- 生成列かどうか
- 値が必要かどうか（NOT NULL）
- 自動増分列かどうか
- 挿入時にデフォルト値があるかどうか
- 更新時にデフォルト値があるかどうか

さらに、このコマンドは以下のバリエーションもサポートします：

- CREATE TABLE … AS SELECT（データが事前に投入されたTableを作成する；CTASとも呼ばれる）
- CREATE TABLE … LIKE（既存のTableの空のコピーを作成する）

## 構文

```sql
CREATE [ EXTERNAL ] TABLE [ IF NOT EXISTS ] <table_name>
    (<columns_definition> [ <indexes_definition> ])
    [ ENGINE = <table_engine_type> ]
    [ <key_type> KEY (<key_cols>)
        [ CLUSTER BY (<cluster_cols>) ]
    ]
    [ COMMENT '<table_comment>' ]
    [ <partitions_definition> ]
    [ DISTRIBUTED BY { HASH (<distribute_cols>) | RANDOM }
        [ BUCKETS { <bucket_count> | AUTO } ]
    ]
    [ <roll_up_definition> ]
    [ PROPERTIES (
          -- Table property
          <table_property>
          -- Additional table properties
          [ , ... ]) 
    ]
```
どこで：

```sql
columns_definition
  : -- Column definition
    <col_name> <col_type>
      [ KEY ]
      [ <col_aggregate_type> ]
      [ [NOT] NULL ]
      [ AUTO_INCREMENT(<col_auto_increment_start_value>) ]
      [ DEFAULT <col_default_value> ]
      [ ON UPDATE CURRENT_TIMESTAMP (<col_on_update_precision>) ]
      [ COMMENT '<col_comment>' ]
    -- Additional column definitions
    [ , <col_name> <col_type> [ ... ] ]
```
```sql
indexes_definition
  : -- Index definition
    INDEX [ IF NOT EXISTS ]
      <index_name> (<index_cols>)
      [ USING <index_type> ]
      [ PROPERTIES (
            -- Table property
            <index_property>
            -- Additional table properties
            [ , ... ]) 
      ]
      [ COMMENT '<index_comment>' ]
    -- Additional index definitions
    [ , <index_name> (<index_cols>) [ ... ] ]
```
```sql
partitions_definition
  : AUTO PARTITION BY RANGE(<auto_partition_function>(<auto_partition_arguments>))
    <origin_partitions_definition>
  | AUTO PARTITION BY LIST(<partition_cols>)
    <origin_partitions_definition>
  | PARTITION BY <partition_type> (<partition_cols>)
    <origin_partitions_definition>
```
其中：

    ```sql
    <origin_partitions_definition>
    : (
        -- パーティション definition
        <one_partition_definition>
        -- Additional partition definition
        [ , ... ]
      )

    <one_partition_definition>
    : PARTITION [ IF NOT EXISTS ] <partition_name>
        VALUES LESS THAN <partition_value_list>
    | PARTITION [ IF NOT EXISTS ] <partition_name>
        VALUES [ <partition_lower_bound>, <partition_upper_bound>)
    | FROM <partition_lower_bound> TO <partition_upper_bound>
        INTERVAL <n> [ <datetime_unit> ]
    | PARTITION [ IF NOT EXISTS ] <partition_name>
        VALUES IN {
            (<partition_value> [, <partition_value> [ ... ] ])
            | <partition_value>
        }
    ```
```sql
roll_up_definition
  : ROLLUP (
        -- Rollup definition
        <rollup_name> (<rollup_cols>)
        [ DUPLICATE KEY (<duplicate_cols>) ]
        -- Additional rollup definition
        [ , <rollup_name> (<rollup_cols>) [ ... ] ]
    )
```
## Varaint Syntax

### CREATE TABLE ... AS SELECT (CTASとも呼ばれる)

Tableを生成し、`query`から返されたデータでそれを入力します：

```sql
CREATE
    [ EXTERNAL ]
    TABLE [ IF NOT EXISTS ] <table_name>
    [ ( <column_definitions> ) ]
    [ <index_definitions> ]
    [ ENGINE = <storage_engine_type> ]
    [ <partitioning_key_type> KEY ( <key_columns> )
        [ CLUSTER BY ( <clustering_columns> ) ]
    ]
    [ COMMENT '<table_description>' ]
    [ <partition_definitions> ]
    [ DISTRIBUTED BY { HASH ( <distribution_columns> ) | RANDOM }
        [ BUCKETS { <number_of_buckets> | AUTO } ]
    ]
    [ <rollup_definitions> ]
    [ PROPERTIES (
          "<table_properties>"
          [ , ... ] 
    ) ]
AS <query>;
```
### CREATE TABLE ... LIKE

既存のTableと同じカラム定義を持つ新しいTableを作成しますが、既存のTableからデータはコピーしません。カラムのすべてのプロパティが新しいTableに複製されます。`rollup`名のリストが指定されている場合、元のTableから対応する`rollup`も複製されます：

```sql
CREATE TABLE <new_table_name> LIKE <existing_table_name>
[ WITH ROLLUP ( <rollup_list> ) ];
```
## 必須パラメータ

**<name>**

> Tableの識別子（すなわち名前）を指定します。Tableが作成されるデータベース内で一意である必要があります。
>
> 識別子は文字で始まる必要があり（Unicode名前サポートが有効な場合はどの言語の文字でも可）、識別子文字列全体がバッククォートで囲まれていない限り（例：``My Object``）、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードを使用できません。
>
> 詳細については、[Identifier Requirements](../../../basic-element/object-identifiers.md)および[Reserved Keywords](../../../basic-element/reserved-keywords.md)を参照してください。

**<col_name>**

> カラムの識別子（すなわち名前）を指定します。作成されるTable内で一意である必要があります。
>
> 識別子は文字（Unicode名前サポートが有効な場合はどの言語の文字でも可）、数字、またはシンボル`@`で始まる必要があり、識別子文字列全体がバッククォートで囲まれていない限り（例：``My Object``）、スペースや特殊文字を含むことはできません。
>
> 詳細については、[Identifier Requirements](../../../basic-element/object-identifiers.md)および[Reserved Keywords](../../../basic-element/reserved-keywords.md)を参照してください。

**<col_type>**

> カラムのデータ型を指定します。
>
> Tableカラムに指定可能なデータ型の詳細については、[Data Types](../../../basic-element/sql-data-types/data-type-overview.md)セクションを参照してください。

**<query>**

> CTASでの必須パラメータです。データを投入するSELECT文を指定します。

**<source_table>**

> CREATE TABLE ... LIKEでの必須パラメータです。コピーする元のTableを指定します。

## オプションパラメータ

### データモデル関連パラメータ

**<key_type>**

> Tableのデータモデルです。オプション値はDUPLICATE（詳細モデル）、UNIQUE（主キーモデル）、AGGREGATE（集約モデル）です。データモデルの詳細については、Data Modelセクションを参照してください。

**<key_cols>**

> Tableのキーカラムです。Dorisでは、KeyカラムはTableの最初のK個のカラムでなければなりません。単一タブレット内のデータは、これらのカラムによって順序を保持されます。Keysの制限とKeyカラムの選択方法については、Data Modelセクションの各サブセクションを参照してください。

**<cluster_cols>**

> データローカルソートカラムです。データモデルがUNIQUE（主キーモデル）の場合にのみ使用できます。`<cluster_cols>`が指定されると、`<key_cols>`を使用する代わりに`<cluster_cols>`でデータがソートされます。

**<col_aggregate_type>**

> カラムの集約方法です。Tableが集約モデルの場合にのみ使用できます。集約方法の詳細については、Aggregation Modelセクションを参照してください。

### バケット関連パラメータ

**<distribute_cols> and <bucket_count>**

> バケットカラムとバケット数です。詳細モデルのバケットカラムは任意のカラムにできますが、集約モデルと主キーモデルのバケットカラムはキーカラムと一致している必要があります。バケット数は任意の正の整数です。バケットの詳細については、Manual BucketingおよびAutomatic Bucketingセクションを参照してください。

### カラムデフォルト値関連パラメータ

**AUTO_INCREMENT(<col_auto_increment_start_value>)**

> データをインポートする際、Dorisは値が指定されていない自動増分カラムのデータ行に、Table内で一意の値を割り当てます。`<col_auto_increment_start_value>`は自動増分カラムの開始値を指定します。自動増分カラムの詳細については、Auto-Increment Columnsセクションを参照してください。

**DEFAULT <col_default_value>**

> カラムのデフォルト値です。このカラムを含めずに書き込む場合、このデフォルト値が使用されます。デフォルト値が明示的に設定されていない場合、NULLが使用されます。利用可能なデフォルト値には以下があります：
>
> - NULL：すべての型で利用可能、NULLをデフォルト値として使用します。
> - 数値リテラル：数値型でのみ使用可能です。
> - 文字列リテラル：文字列型でのみ使用可能です。
> - CURRENT_DATE：日付型でのみ使用可能です。現在の日付をデフォルト値として使用します。
> - CURRENT_TIMESTAMP [ <defaultValuePrecision> ]：日時型でのみ使用可能です。現在のタイムスタンプをデフォルト値として使用します。`<defaultValuePrecision>`で時刻精度を指定できます。
> - PI：double型でのみ使用可能です。円周率をデフォルト値として使用します。
> - E：double型でのみ使用可能です。数学定数eをデフォルト値として使用します。
> - BITMAP_EMPTY：カラムがbitmap型の場合にのみ使用可能です。空のビットマップを埋めます。

**ON UPDATE CURRENT_TIMESTAMP (<col_on_update_precision>)**

> データが更新される際、このカラムに値が指定されていない場合、現在のタイムスタンプを使用してこのカラムのデータを更新します。UNIQUE（主キーモデル）のTableでのみ使用できます。

### インデックス関連パラメータ

**<index_name>**

> インデックスの識別子（すなわち名前）を指定します。作成されるTable内で一意である必要があります。識別子の詳細については、[Identifier Requirements](../../../basic-element/object-identifiers.md)および[Reserved Keywords](../../../basic-element/reserved-keywords.md)を参照してください。

**<index_cols>**

> インデックスを追加するカラムのリストです。Table内の既存のカラムである必要があります。

**<index_type>**

> インデックスの種類です。現在はINVERTEDのみサポートされています。

**<index_property>**

> インデックスのプロパティです。詳細な説明については、Inverted Indexセクションを参照してください。

### 自動パーティション関連パラメータ

パーティションの詳細な紹介については、Automatic Partitioningセクションを参照してください。

### 手動パーティション関連パラメータ

パーティションの詳細な紹介については、「Manual Partitioning」セクションを参照してください。

**<partition_type>**

> DorisはRANGEパーティションとLISTパーティションをサポートしています。詳細については、Manual Partitioningセクションを参照してください。

**<partition_name>**

> パーティションの識別子（すなわち名前）です。作成されるTable内で一意である必要があります。識別子の詳細については、[Identifier Requirements](../../../basic-element/object-identifiers.md)および[Reserved Keywords](../../../basic-element/reserved-keywords.md)を参照してください。

**VALUES LESS THAN <partition_value_list>**

> RANGEパーティションです。パーティションデータ範囲は下限から`<partition_value_list>`までです。
>
> 上限を表す場合、`<partition_value_list>`は`MAX_VALUE`に簡略化できます。
>
> `<partition_value_list>`の形式は以下の通りです：`((col_1_value, ...), (col_1_value, ...), ...)`

**VALUES [ <partition_lower_bound>, <partition_upper_bound>)**

> RANGEパーティションです。パーティションデータ範囲は`<partition_lower_bound>`から`<partition_upper_bound>`までです。1つのパーティションのみが作成されます。
>
> `<partition_lower_bound>`と`<partition_upper_bound>`の形式は以下の通りです：`(col_1_value, ...)`

**FROM <partition_lower_bound> TO <partition_upper_bound>**

**INTERVAL <n> [ <datetime_unit> ]**

> RANGEパーティションです。パーティションデータ範囲は`<partition_lower_bound>`から`<partition_value_list>`までです。`<n>`ごとにパーティションが作成されます。
>
> `<partition_lower_bound>`と`<partition_upper_bound>`の形式は以下の通りです：`(col_1_value, ...)`

**VALUES IN {**

​          **(<partition_value> [, <partition_value> [ ... ] ])**

​          **| <partition_value>**

​      **}**

> LISTパーティションです。パーティションカラムが`<partition_value>`と等しい行がこのパーティションに属します。
>
> `<partition_value>`の形式は以下の通りです：`(col_1_value, ...)`

### 同期マテリアライズドビュー関連

:::caution 注意
rollupで同期マテリアライズドビューを作成する機能は制限があり、もはや推奨されません。別のステートメントを使用して同期マテリアライズドビューを作成することをお勧めします。詳細については、[CREATE MATERIALIZED VIEW](../sync-materialized-view/CREATE-MATERIALIZED-VIEW.md)ステートメントおよびSynchronized Materialized Viewセクションを参照してください。
:::

**<rollup_name>**

> 同期マテリアライズドビューの識別子（すなわち名前）です。作成されるTable内で一意である必要があります。識別子の詳細については、[Identifier Requirements](../../../basic-element/object-identifiers.md)および[Reserved Keywords](../../../basic-element/reserved-keywords.md)を参照してください。

**<rollup_cols>**

> 同期マテリアライズドビューに含まれるカラムです。

### Tableプロパティ関連パラメータ

**<table_property>**

| プロパティ名 | 機能 |
| :------------ | :-------- |
| replication_num | レプリカ数です。デフォルトのレプリカ数は3です。BEノード数が3未満の場合、BEノード数以下のレプリカ数を指定する必要があります。バージョン0.15以降、このプロパティは自動的に`replication_allocation`プロパティに変換されます。例：`"replication_num" = "3"`は自動的に`"replication_allocation" = "tag.location.default:3"`に変換されます。 |
| replication_allocation | Tagsに基づいてレプリカの分散を設定します。このプロパティは`replication_num`プロパティの機能を完全に上書きできます。 |
| min_load_replica_num | データインポート成功に必要な最小レプリカ数を設定します。デフォルト値は-1です。このプロパティが0以下の場合、データインポートには過半数のレプリカが成功する必要があることを示します。 |
| is_being_synced | このTableがCCRによって複製されており、現在syncerによって同期中であることを識別するために使用されます。デフォルト値は`false`です。`true`に設定すると、`colocate_with`と`storage_policy`プロパティがクリアされます。`dynamic partition`と`auto bucket`機能は無効になります。つまり、`show create table`では有効に見えますが、実際には効果がありません。`is_being_synced`が`false`に設定されると、これらの機能が再開されます。このプロパティはCCR周辺モジュールでのみ使用され、CCR同期プロセス中に手動で設定すべきではありません。 |
| storage_medium | Tableデータの初期ストレージメディアを宣言します。 |
| storage_cooldown_time | Tableデータの初期ストレージメディアの有効期限を設定します。この時間後、自動的に第1級ストレージメディアにダウングレードされます。 |
| colocate_with | Colocation Join機能が必要な場合、このパラメータを使用してColocation Groupを設定します。 |
| bloom_filter_columns | ユーザーが指定するBloom Filterインデックスを追加する必要があるカラム名のリストです。各カラムのBloom Filterインデックスは独立しており、複合インデックスではありません。例：`"bloom_filter_columns" = "k1, k2, k3"` |
| compression | DorisTableのデフォルト圧縮方法はLZ4です。バージョン1.1以降、より高い圧縮率のためにZSTDを圧縮方法として指定するサポートが利用可能です。 |
| function_column.sequence_col | Unique Keyモデルを使用する場合、Sequenceカラムを指定できます。Keyカラムが同じ場合、Sequenceカラムに従ってREPLACEが実行されます（大きい値が小さい値を置き換える。そうでなければ置き換えられません）。`function_column.sequence_col`はsequenceカラムをTable内の特定のカラムにマッピングするために使用され、整数型または日付/時刻型（DATE、DATETIME）にできます。このカラムの型は作成後に変更できません。`function_column.sequence_col`が設定されている場合、`function_column.sequence_type`は無視されます。 |
| function_column.sequence_type | Unique Keyモデルを使用する場合、Sequenceカラムを指定できます。Keyカラムが同じ場合、Sequenceカラムに従ってREPLACEが実行されます（大きい値が小さい値を置き換える。そうでなければ置き換えられません）。ここでは、sequenceカラムの型のみを指定する必要があり、日付/時刻型または整数をサポートします。Dorisは隠しsequenceカラムを作成します。 |
| enable_unique_key_merge_on_write | UniqueTableがMerge-on-Write実装を使用するかどうかです。このプロパティはバージョン2.1より前はデフォルトで無効で、バージョン2.1以降はデフォルトで有効です。 |
| light_schema_change | Light Schema Change最適化を使用するかどうかです。`true`に設定すると、valueカラムの追加および減算操作をより高速かつ同期的に完了できます。この機能はバージョン2.0.0以降でデフォルトで有効です。 |
| disable_auto_compaction | このTableの自動コンパクションを無効にするかどうかです。このプロパティが`true`に設定されると、バックグラウンドの自動コンパクションプロセスはこのTableのすべてのタブレットをスキップします。 |
| enable_single_replica_compaction | このTableの単一レプリカコンパクションを有効にするかどうかです。このプロパティが`true`に設定されると、Tableのタブレットのすべてのレプリカのうち1つのレプリカのみが実際のコンパクション動作を実行し、他のレプリカはそのレプリカからコンパクションされたrowsetを取得します。 |
| enable_duplicate_without_keys_by_default | `true`に設定すると、Table作成時にUnique、Aggregate、またはDuplicateが指定されていない場合、ソートカラムと前置インデックスのないDuplicateモデルTableがデフォルトで作成されます。 |
| skip_write_index_on_load | このTableのデータインポート中にインデックス書き込みをしないことを有効にするかどうかです。このプロパティが`true`に設定されると、データインポート中にインデックスが書き込まれず（現在は転置インデックスのみ有効）、コンパクションまで遅延されます。これにより、最初の書き込みとコンパクション中にインデックスを繰り返し書き込むCPUとIOリソース消費を回避し、高スループットインポートのパフォーマンスを向上させることができます。 |
| compaction_policy | このTableのコンパクションマージポリシーを設定します。time_seriesまたはsize_basedtime_seriesのみサポートします：rowsetのディスクボリュームが特定のサイズに蓄積されると、バージョンマージが実行されます。マージされたrowsetは直接base compactionフェーズに昇格します。これにより、継続的なインポートシナリオでのcompactの書き込み増幅を効果的に減らします。このポリシーはtime_series_compactionプレフィックスのパラメータを使用してコンパクションの実行を調整します。 |
| time_series_compaction_goal_size_mbytes | コンパクションマージポリシーがtime_seriesの場合、このパラメータは各コンパクションの入力ファイルサイズを調整するために使用され、出力ファイルサイズは入力と同等です。 |
| time_series_compaction_file_count_threshold | コンパクションマージポリシーがtime_seriesの場合、このパラメータは各コンパクションの最小入力ファイル数を調整するために使用されます。タブレット内のファイル数がこの設定を超えると、コンパクションがトリガーされます。 |
| time_series_compaction_time_threshold_seconds | コンパクションマージポリシーがtime_seriesの場合、このパラメータはコンパクション間の最長間隔を調整するために使用されます。つまり、長時間実行されていない場合にコンパクションがトリガーされます（秒単位）。 |
| time_series_compaction_level_threshold | コンパクションマージポリシーがtime_seriesの場合、このパラメータはデフォルトで1です。2に設定すると、一度マージされたセグメントが再度マージされ、セグメントサイズがtime_series_compaction_goal_size_mbytesに達することを制御し、セグメント数を削減する効果を実現するために使用されます。 |
| group_commit_interval_ms | このTableのGroup Commitバッチ間隔を設定します。単位はmsで、デフォルト値は10000ms、つまり10sです。Group Commitのタイミングは`group_commit_interval_ms`と`group_commit_data_bytes`のどちらが先に設定値に達するかに依存します。 |
| group_commit_data_bytes | このTableのGroup Commitバッチデータサイズを設定します。単位はbytesで、デフォルト値は134217728、つまり128MBです。Group Commitのタイミングは`group_commit_interval_ms`と`group_commit_data_bytes`のどちらが先に設定値に達するかに依存します。 |
| enable_mow_light_delete | MowのUniqueTableでDeleteステートメントによるDelete述語の書き込みを有効にするかどうかです。有効にすると、Deleteステートメントのパフォーマンスが向上しますが、Delete後の部分カラム更新でデータエラーが発生する可能性があります。無効にすると、正確性を保証するためにDeleteステートメントのパフォーマンスが低下します。このプロパティのデフォルト値は`false`です。このプロパティはUnique Merge-on-WriteTableでのみ有効にできます。 |
| 動的パーティション関連プロパティ | 動的パーティションについては、Data Partitioning - Dynamic Partitioningを参照してください |

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限が必要です：

| 権限 | オブジェクト | 説明 |
| :---------------- | :------------------------ | :----------------------------------------------------------- |
| CREATE_PRIV | Database | |
| SELECT_PRIV | Table, View | CTASを実行する場合、クエリされるTable、ビュー、またはマテリアライズドビューに対してSELECT_PRIVが必要です |

## 使用上の注意

- データベース（Database）には同じ名前のTable（Table）またはビュー（View）を含むことはできません。
- Table名、カラム名、rollup名は[Reserved Keywords](../../../basic-element/reserved-keywords.md)を使用してはなりません。
- CREATE TABLE ... LIKE：
  - このコマンドは内部DorisTableでのみ使用できます。
  - 明示的に指定されたrollupのみがコピーされます。
  - すべての同期マテリアライズドビューは複製されません。
- CREATE TABLE ... AS SELECT (CTAS)：
  - SELECTリスト内のカラム名のエイリアスが有効なカラムの場合、CTASステートメントでカラム定義は不要です。省略された場合、カラム名とデータ型はベースクエリから推測されます：

    ```sql
    CREATE TABLE <table_name> AS SELECT ...
    ```
- また、以下の構文を使用して明示的に名前を指定することもできます：

    ```sql
    CREATE TABLE <table_name> ( <col1_name>, <col2_name>, ... ) AS SELECT ...
    ```
- パーティショニングとバケッティング
  - Tableはバケッティング列を指定する必要がありますが、パーティションの指定は省略することができます。パーティショニングとバケッティングの詳細情報については、Data Partitioningドキュメントを参照してください。
  - DorisのTableは、パーティション化されたTableまたは非パーティション化Tableのいずれかになります。この属性はTable作成時に決定され、後から変更することはできません。つまり、パーティション化されたTableの場合、後の使用でパーティションを追加または削除することができますが、非パーティション化Tableには後からパーティションを追加することはできません。
  - パーティション列とバケット列は、Table作成後に変更することはできません。パーティション列とバケット列の型を変更することも、これらの列を追加または削除することもできません。
- Dynamic Partitioning
  - Dynamic Partitioning機能は、主にユーザーがパーティションを自動的に管理するのを支援するために使用されます。特定のルールを設定することで、Dorisシステムは定期的に新しいパーティションを追加したり、古いパーティションを削除したりします。詳細については、Dynamic Partitioningドキュメントを参照してください。
- Automatic Partitioning
  - Automatic Partitioningのドキュメントは、Automatic Partitioningで確認できます。
- Synchronized Materialized Views
  - ユーザーは、Tableの作成時に複数のSynchronized Materialized Views（ROLLUP）を作成できます。Synchronized Materialized Viewsは、Table作成後に追加することもできます。Table作成文に含めることで、すべてのSynchronized Materialized Viewsを一度に作成することが容易になります。
  - Synchronized Materialized ViewsがTable作成時に作成される場合、その後のすべてのデータインポート操作は、マテリアライズドビューのデータを同期的に生成します。マテリアライズドビューの数は、データインポートの効率に影響する可能性があります。
  - マテリアライズドビューの紹介については、Synchronized Materialized Viewsのドキュメントを参照してください。
- インデックス
  - ユーザーは、Tableの作成時に複数の列インデックスを作成できます。インデックスは、Table作成後に追加することもできます。
  - 後の使用でインデックスが追加され、Tableに既存のデータがある場合、すべてのデータを書き換える必要があるため、インデックスの作成時間は現在のデータ量に依存します。

## Examples

### Basic Examples

**Detail Model**

```sql
CREATE TABLE t1
(
  c1 INT,
  c2 STRING
)
DUPLICATE KEY(c1)
DISTRIBUTED BY HASH(c1)
PROPERTIES (
  'replication_num' = '1'
);
```
**Aggregation Model**

```sql
CREATE TABLE t2
(
  c1 INT,
  c2 INT MAX
)
AGGREGATE KEY(c1)
DISTRIBUTED BY HASH(c1)
PROPERTIES (
  'replication_num' = '1'
);
```
**Primary Key Model**

```sql
CREATE TABLE t3
(
  c1 INT,
  c2 INT
)
UNIQUE KEY(c1)
DISTRIBUTED BY HASH(c1)
PROPERTIES (
  'replication_num' = '1'
);
```
**列のデフォルト値の指定**

```sql
CREATE TABLE t5
(
  c1 INT,
  c2 INT DEFAULT 10
)
DUPLICATE KEY(c1)
DISTRIBUTED BY HASH(c1)
PROPERTIES (
  'replication_num' = '1'
);
```
**Bucketing Method**

```sql
CREATE TABLE t6
(
  c1 INT,
  c2 INT
)
DUPLICATE KEY(c1)
DISTRIBUTED BY RANDOM
PROPERTIES (
  'replication_num' = '1'
);
```
**自動パーティショニング**

```sql
CREATE TABLE t7
(
  c1 INT,
  c2 DATETIME NOT NULL
)
DUPLICATE KEY(c1)
AUTO PARTITION BY RANGE(date_trunc(c2, 'day')) ()
DISTRIBUTED BY RANDOM
PROPERTIES (
  'replication_num' = '1'
);
```
**Range Partitioning**

```sql
CREATE TABLE t8
(
  c1 INT,
  c2 DATETIME NOT NULL
)
DUPLICATE KEY(c1)
PARTITION BY RANGE(c2) (
  FROM ('2020-01-01') TO ('2020-01-10') INTERVAL 1 DAY
)
DISTRIBUTED BY RANDOM
PROPERTIES (
  'replication_num' = '1'
);
```
**List Partitioning**

```sql
CREATE TABLE t9
(
  c1 INT,
  c2 DATE NOT NULL
)
DUPLICATE KEY(c1)
PARTITION BY LIST(c2) (
  PARTITION p1 VALUES IN (('2020-01-01'),('2020-01-02'))
)
DISTRIBUTED BY RANDOM
PROPERTIES (
  'replication_num' = '1'
);
```
**Storage Medium と Cooldown Time**

```sql
CREATE TABLE example_db.table_hash
(
    k1 BIGINT,
    k2 LARGEINT,
    v1 VARCHAR(2048),
    v2 SMALLINT DEFAULT "10"
)
UNIQUE KEY(k1, k2)
DISTRIBUTED BY HASH (k1, k2) BUCKETS 32
PROPERTIES(
    "storage_medium" = "SSD",
    "storage_cooldown_time" = "2015-06-04 00:00:00"
);
```
**`storage_policy`プロパティを使用したTableのコールド・ホット階層データ移行戦略の設定**

1. Tableが移行戦略と正常に関連付けられるよう、最初にs3リソースとストレージポリシーを作成する必要があります。

    ```sql
    -- Non-partitioned table
    CREATE TABLE IF NOT EXISTS create_table_use_created_policy 
    (
        k1 BIGINT,
        k2 LARGEINT,
        v1 VARCHAR(2048)
    )
    UNIQUE KEY(k1)
    DISTRIBUTED BY HASH (k1) BUCKETS 3
    PROPERTIES(
        "storage_policy" = "test_create_table_use_policy",
        "replication_num" = "1"
    );

    -- Partitioned table
    CREATE TABLE create_table_partion_use_created_policy
    (
        k1 DATE,
        k2 INT,
        V1 VARCHAR(2048) REPLACE
    ) PARTITION BY RANGE (k1) (
        PARTITION p1 VALUES LESS THAN ("2022-01-01") ("storage_policy" = "test_create_table_partition_use_policy_1" ,"replication_num"="1"),
        PARTITION p2 VALUES LESS THAN ("2022-02-01") ("storage_policy" = "test_create_table_partition_use_policy_2" ,"replication_num"="1")
    ) DISTRIBUTED BY HASH(k2) BUCKETS 1;
    ```
**コロケーショングループ**

```sql
CREATE TABLE t1 (
    id int(11) COMMENT "",
    value varchar(8) COMMENT ""
)
DUPLICATE KEY(id)
DISTRIBUTED BY HASH(id) BUCKETS 10
PROPERTIES (
    "colocate_with" = "group1"
);

CREATE TABLE t2 (
    id int(11) COMMENT "",
    value1 varchar(8) COMMENT "",
    value2 varchar(8) COMMENT ""
)
DUPLICATE KEY(`id`)
DISTRIBUTED BY HASH(`id`) BUCKETS 10
PROPERTIES (
    "colocate_with" = "group1"
);
```
**Index**

```sql
CREATE TABLE example_db.table_hash
(
    k1 TINYINT,
    k2 DECIMAL(10, 2) DEFAULT "10.5",
    v1 CHAR(10) REPLACE,
    v2 INT SUM,
    INDEX k1_idx (k1) USING INVERTED COMMENT 'my first index'
)
AGGREGATE KEY(k1, k2)
DISTRIBUTED BY HASH(k1) BUCKETS 32
PROPERTIES (
    "bloom_filter_columns" = "k2"
);
```
**Tableのレプリケーションプロパティの設定**

```sql
CREATE TABLE example_db.table_hash
(
    k1 TINYINT,
    k2 DECIMAL(10, 2) DEFAULT "10.5"
)
DISTRIBUTED BY HASH(k1) BUCKETS 32
PROPERTIES (
    "replication_allocation"="tag.location.group_a:1, tag.location.group_b:2"
);
```
**Dynamic Partitioning**

このTableは3日前にパーティションを作成し、3日前のパーティションを削除します。例えば、今日が`2020-01-08`の場合、`p20200108`、`p20200109`、`p20200110`、`p20200111`という名前のパーティションを作成します。パーティション範囲は以下の通りです：

```Plain
[types: [DATE]; keys: [2020-01-08]; ‥types: [DATE]; keys: [2020-01-09]; )
[types: [DATE]; keys: [2020-01-09]; ‥types: [DATE]; keys: [2020-01-10]; )
[types: [DATE]; keys: [2020-01-10]; ‥types: [DATE]; keys: [2020-01-11]; )
[types: [DATE]; keys: [2020-01-11]; ‥types: [DATE]; keys: [2020-01-12]; )
CREATE TABLE example_db.dynamic_partition
(
    k1 DATE,
    k2 INT,
    k3 SMALLINT,
    v1 VARCHAR(2048),
    v2 DATETIME DEFAULT "2014-02-04 15:36:00"
)
DUPLICATE KEY(k1, k2, k3)
PARTITION BY RANGE (k1) ()
DISTRIBUTED BY HASH(k2) BUCKETS 32
PROPERTIES(
    "dynamic_partition.time_unit" = "DAY",
    "dynamic_partition.start" = "-3",
    "dynamic_partition.end" = "3",
    "dynamic_partition.prefix" = "p",
    "dynamic_partition.buckets" = "32" 
);
```
**Dynamic Partitionのレプリケーションプロパティの設定**

```sql
CREATE TABLE example_db.dynamic_partition
(
    k1 DATE,
    k2 INT,
    k3 SMALLINT,
    v1 VARCHAR(2048),
    v2 DATETIME DEFAULT "2014-02-04 15:36:00"
)
PARTITION BY RANGE (k1) ()
DISTRIBUTED BY HASH(k2) BUCKETS 32
PROPERTIES(
    "dynamic_partition.time_unit" = "DAY",
    "dynamic_partition.start" = "-3",
    "dynamic_partition.end" = "3",
    "dynamic_partition.prefix" = "p",
    "dynamic_partition.buckets" = "32",
    "dynamic_partition.replication_allocation" = "tag.location.group_a:3"
 );
```
### CTAS 例

```sql
CREATE TABLE t10
PROPERTIES (
  'replication_num' = '1'
)
AS SELECT * FROM t1;
```
### CREATE TABLE ... LIKE の例

```sql
CREATE TABLE t11 LIKE t10;
```
