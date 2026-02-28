---
{
  "title": "概要 | Table設計",
  "description": "ユーザーはCREATE TABLE文を使用してDorisにTableを作成できます。",
  "language": "ja"
}
---
# 概要

## Tableの作成

ユーザーはCREATE TABLE文を使用してDorisでTableを作成できます。また、CREATE TABLE LIKEやCREATE TABLE AS句を使用して、別のTableからTable定義を派生させることもできます。

## Table名

Dorisでは、デフォルトでTable名は大文字と小文字が区別されます。初期クラスターセットアップ時にlower_case_table_namesを設定することで、大文字と小文字を区別しないようにできます。Table名のデフォルト最大長は64バイトですが、table_name_length_limitを設定することで変更できます。この値を高く設定しすぎることは推奨されません。Table作成の構文については、CREATE TABLEを参照してください。

## Tableプロパティ

Dorisでは、CREATE TABLE文でTableプロパティを指定できます。これには以下が含まれます：

- **buckets**: Table内でのデータの分散を決定します。

- **storage_medium**: HDD、SSD、またはリモート共有ストレージの使用など、データのストレージ方法を制御します。

- **replication_num**: 冗長性と信頼性を確保するため、データレプリカの数を制御します。

- **storage_policy**: コールドデータとホットデータの分離ストレージのマイグレーション戦略を制御します。

これらのプロパティはパーティションに適用されます。つまり、パーティションが作成された後、それは独自のプロパティを持つことになります。Tableプロパティを変更すると、将来作成されるパーティションにのみ影響し、既存のパーティションには影響しません。Tableプロパティの詳細については、ALTER TABLE PROPERTYを参照してください。[Dynamic partitions](data-partitioning/dynamic-partitioning.md)では、これらのプロパティを個別に設定できます。

## 注意事項

1. **適切なデータモデルを選択**: データモデルは変更できないため、Table作成時に適切な[データモデル](../table-design/data-model/overview.md)を選択する必要があります。

2. **適切なバケット数を選択**: すでに作成されたパーティションのバケット数は変更できません。[パーティションの置換](../data-operate/delete/table-temp-partition.md)によってバケット数を変更することができます。また、動的パーティションでまだ作成されていないパーティションのバケット数を変更することもできます。

3. **カラム追加操作**: VALUEカラムの追加や削除は軽量な操作で、数秒で完了できます。KEYカラムの追加や削除、またはデータ型の変更は重い操作で、完了時間はデータ量に依存します。大きなデータセットの場合は、KEYカラムの追加や削除、データ型の変更を避けることを推奨します。

4. **ストレージ戦略の最適化**: 階層ストレージを使用して、コールドデータをHDDやS3/HDFSに保存できます。
