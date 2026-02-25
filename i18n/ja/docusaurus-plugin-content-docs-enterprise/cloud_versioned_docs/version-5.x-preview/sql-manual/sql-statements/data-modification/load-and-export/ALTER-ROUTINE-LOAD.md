---
{
  "title": "ALTER ROUTINE LOAD",
  "description": "この構文は、既存のroutine load jobを変更するために使用されます。PAUSED状態のjobのみ変更可能です。",
  "language": "ja"
}
---
## 説明

この構文は、既存のroutine loadジョブを変更するために使用されます。PAUSED状態のジョブのみ変更できます。

## 構文

```sql
ALTER ROUTINE LOAD FOR [<db>.]<job_name>
[<job_properties>]
FROM [<data_source>]
[<data_source_properties>]
```
## 必須パラメータ

**1. `[<db>.]<job_name>`**

> 変更するジョブの名前を指定します。識別子は文字で始まる必要があり、識別子文字列全体がバッククォートで囲まれていない限り、スペースや特殊文字を含むことはできません。
>
> 識別子は予約キーワードを使用できません。詳細については、識別子要件と予約キーワードを参照してください。

## オプションパラメータ

**1. `<job_properties>`**

> 変更するジョブパラメータを指定します。現在サポートされているパラメータには以下があります：
> 
> - desired_concurrent_number
> - max_error_number
> - max_batch_interval
> - max_batch_rows
> - max_batch_size
> - jsonpaths
> - json_root
> - strip_outer_array
> - strict_mode
> - timezone
> - num_as_string
> - fuzzy_parse
> - partial_columns
> - max_filter_ratio

**2. `<data_source_properties>`**

> データソースに関連するプロパティ。現在サポートしているもの：
> 
> - `<kafka_partitions>`
> - `<kafka_offsets>`
> - `<kafka_broker_list>`
> - `<kafka_topic>`
> - `<property.group.id>` などのカスタムプロパティ

**3. `<data_source>`**

> データソースのタイプ。現在サポートしているもの：
> 
> - KAFKA

## アクセス制御要件

このSQLコマンドを実行するユーザーは、少なくとも以下の権限を持つ必要があります：

| 権限 | オブジェクト | 注意事項 |
| :-------- | :----- | :---- |
| LOAD_PRIV | Table | SHOW ROUTINE LOADはテーブルのLOAD権限が必要です |

## 注意事項

- `kafka_partitions` と `kafka_offsets` は消費するkafkaパーティションのオフセットを変更するために使用され、現在消費されているパーティションのみ変更可能です。新しいパーティションを追加することはできません。

## 例

- `desired_concurrent_number` を1に変更

    ```sql
    ALTER ROUTINE LOAD FOR db1.label1
    PROPERTIES
    (
        "desired_concurrent_number" = "1"
    );
    ```
- `desired_concurrent_number`を10に変更し、パーティションオフセットを変更し、group idを変更する

    ```sql
    ALTER ROUTINE LOAD FOR db1.label1
    PROPERTIES
    (
        "desired_concurrent_number" = "10"
    )
    FROM kafka
    (
        "kafka_partitions" = "0, 1, 2",
        "kafka_offsets" = "100, 200, 100",
        "property.group.id" = "new_group"
    );
    ```
