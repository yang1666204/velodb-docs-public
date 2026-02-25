---
{
  "title": "重複キーテーブル",
  "description": "DorisのDuplicate Key Tableは、デフォルトのテーブルタイプであり、個別の生データレコードを保存するように設計されています。",
  "language": "ja"
}
---
DorisのDuplicateKeyTableはデフォルトのテーブル型であり、個別の生データレコードを格納するために設計されています。テーブル作成時に指定される`Duplicate Key`は、ソートと格納のための列を決定し、一般的なクエリを最適化します。ソートキーとして選択する列は3列以下にすることを推奨します。より具体的な選択ガイドラインについては、[Sort Key](../index/prefix-index)を参照してください。Duplicate Key Tableには以下の特徴があります。

* **生データの保持**: Duplicate Key Tableはすべての元のデータを保持し、生データの格納とクエリに最適です。データ損失を避けるため、詳細なデータ分析が必要な用途に推奨されます。

* **重複排除や集約なし**: AggregateテーブルやPrimary Keyテーブルとは異なり、Duplicate Key Tableは重複排除や集約を行わず、同一レコードを完全に保持します。

* **柔軟なデータクエリ**: Duplicate Key Tableはすべての元のデータを保持し、メタデータ監査や細粒度分析のために任意の次元での詳細な抽出と集約を可能にします。

## 使用例

Duplicate Key Tableでは、データは通常追加のみされ、古いデータは更新されません。Duplicate Key Tableは、完全な生データを必要とするシナリオに最適です。

* **ログストレージ**: アクセスログやエラーログなど、さまざまなタイプのアプリケーションログを格納するために使用されます。各データは将来の監査と分析のために詳細である必要があります。

* **ユーザー行動データ**: クリックデータやユーザーアクセスパスなど、ユーザー行動を分析する際、詳細なユーザーアクションを保持する必要があります。これはユーザープロファイルの構築と行動パターンの詳細分析に役立ちます。

* **トランザクションデータ**: トランザクションや注文データを格納する場合、トランザクションが完了すると、通常はデータ変更の必要がありません...


## テーブル作成手順

テーブル作成時、**DUPLICATE KEY**キーワードを使用してDuplicate Key Tableを指定できます。Duplicate Keyテーブルは、格納時にデータをソートするために使用されるKey列を指定する必要があります。以下の例では、Duplicate Key Tableがログ情報を格納し、`log_time`、`log_type`、`error_code`列に基づいてデータをソートしています。

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
## データ挿入とストレージ

Duplicate Key テーブルでは、データは重複除去や集約されません。データを挿入すると直接ストレージに保存されます。Duplicate Key Table の Key カラムはソートに使用されます。

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
