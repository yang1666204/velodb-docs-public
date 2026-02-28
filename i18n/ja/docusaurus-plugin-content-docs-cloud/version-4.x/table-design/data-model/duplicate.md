---
{
  "title": "重複キーTable",
  "description": "Doris の Duplicate Key Table はデフォルトのTableタイプで、個別の生データレコードを格納するために設計されています。",
  "language": "ja"
}
---
DorisのDuplicate Key Tableは、個々の生データレコードを格納するために設計されたデフォルトのTableタイプです。Table作成時に指定される`Duplicate Key`は、ソートと格納のためのカラムを決定し、一般的なクエリを最適化します。ソートキーとして選択するカラムは3つ以内にすることが推奨されます。より具体的な選択ガイドラインについては、[Sort Key](../index/prefix-index)を参照してください。Duplicate Key Tableには以下の特徴があります：

* **生データの保持**: Duplicate Key Tableは元のデータをすべて保持するため、生データの格納とクエリに最適です。データ損失を避けるために、詳細なデータ分析が必要なユースケースに推奨されます。

* **重複排除や集約なし**: AggregateTableやPrimary KeyTableとは異なり、Duplicate Key Tableは重複排除や集約を実行せず、同一レコードを完全に保持します。

* **柔軟なデータクエリ**: Duplicate Key Tableは元のデータをすべて保持するため、メタデータ監査や詳細な分析のために、あらゆる次元での詳細な抽出と集約が可能です。

## ユースケース

Duplicate Key Tableでは、一般的にデータは追記のみされ、古いデータは更新されません。Duplicate Key Tableは、完全な生データが必要なシナリオに最適です：

* **ログ格納**: アクセスログやエラーログなど、さまざまなタイプのアプリケーションログを格納するために使用されます。各データは将来の監査と分析のために詳細である必要があります。

* **ユーザー行動データ**: クリックデータやユーザーアクセスパスなど、ユーザー行動を分析する際、詳細なユーザーアクションを保持する必要があります。これは、ユーザープロファイルの構築と行動パターンの詳細な分析に役立ちます。

* **取引データ**: 取引や注文データを格納する場合、取引が完了すると、通常はデータの変更は必要ありません...


## Table作成手順

Tableを作成する際、**DUPLICATE KEY**キーワードを使用してDuplicate Key Tableを指定できます。Duplicate Key tableは、格納時のデータソートに使用されるKeyカラムを指定する必要があります。以下の例では、Duplicate Key tableはログ情報を格納し、`log_time`、`log_type`、`error_code`カラムに基づいてデータをソートします：

```sql
CREATE TABLE IF NOT EXISTS example_tbl_duplicate
(
    log_time        DATETIME       NOT NULL,
    log_type        INT            NOT NULL,
    error_code      INT,
    error_msg       VARCHAR(1024),
    op_id           BIGINT,
    op_time         DATETIME
)
DUPLICATE KEY(log_time, log_type, error_code)
DISTRIBUTED BY HASH(log_type) BUCKETS 10;
```
## データの挿入と保存

Duplicate Key Tableでは、データは重複排除や集約されません。データを挿入すると直接格納されます。Duplicate Key Table の Key 列はソートに使用されます。

![columnar_storage](/images/table-desigin/duplicate-table-insert.png)

上記の例では、初期の4行に2行を挿入した後、データが追加され、合計6行になります。

```sql
-- 4 rows raw data
INSERT INTO example_tbl_duplicate VALUES
('2024-11-01 00:00:00', 2, 2, 'timeout', 12, '2024-11-01 01:00:00'),
('2024-11-02 00:00:00', 1, 2, 'success', 13, '2024-11-02 01:00:00'),
('2024-11-03 00:00:00', 2, 2, 'unknown', 13, '2024-11-03 01:00:00'),
('2024-11-04 00:00:00', 2, 2, 'unknown', 12, '2024-11-04 01:00:00');

-- insert into 2 rows
INSERT INTO example_tbl_duplicate VALUES
('2024-11-01 00:00:00', 2, 2, 'timeout', 12, '2024-11-01 01:00:00'),
('2024-11-01 00:00:00', 2, 2, 'unknown', 13, '2024-11-01 01:00:00');

-- check the rows of table
SELECT * FROM example_tbl_duplicate;
+---------------------+----------+------------+-----------+-------+---------------------+
| log_time            | log_type | error_code | error_msg | op_id | op_time             |
+---------------------+----------+------------+-----------+-------+---------------------+
| 2024-11-02 00:00:00 |        1 |          2 | success   |    13 | 2024-11-02 01:00:00 |
| 2024-11-01 00:00:00 |        2 |          2 | timeout   |    12 | 2024-11-01 01:00:00 |
| 2024-11-03 00:00:00 |        2 |          2 | unknown   |    13 | 2024-11-03 01:00:00 |
| 2024-11-04 00:00:00 |        2 |          2 | unknown   |    12 | 2024-11-04 01:00:00 |
| 2024-11-01 00:00:00 |        2 |          2 | unknown   |    13 | 2024-11-01 01:00:00 |
| 2024-11-01 00:00:00 |        2 |          2 | timeout   |    12 | 2024-11-01 01:00:00 |
+---------------------+----------+------------+-----------+-------+---------------------+
```
