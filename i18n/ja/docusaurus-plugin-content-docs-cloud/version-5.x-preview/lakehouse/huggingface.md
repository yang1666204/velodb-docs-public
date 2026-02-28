---
{
  "title": "Hugging Face データの分析",
  "description": "Hugging Faceは、ユーザーが機械学習モデルやデータセットの保存、共有、および構築における共同作業を行うことができる人気の集中型プラットフォームです、",
  "language": "ja"
}
---
[Hugging Face](https://huggingface.co/) は、ユーザーが機械学習モデル、データセット、その他のリソースを保存、共有、協力して構築できる人気の集約プラットフォームです。

[Hugging Face Dataset](https://huggingface.co/datasets) には、リポジトリタイプに応じて、CSV、Parquet、JSONL などのデータファイルが含まれている場合があります。

[HTTP Table Value ファンクション](../sql-manual/sql-functions/table-valued-functions/http.md) 機能を通じて、Doris は SQL を介して Hugging Face データセット上のデータに直接アクセスできます。

:::note
この機能はバージョン 4.0.2 以降でサポートされています
:::

## 使用方法

Doris は HTTP プロトコルを通じて Hugging Face Dataset のデータにアクセスします。

自動型推論をサポートしています。データ処理のために `CREATE TABLE AS SELECT` と `INSERT INTO ... SELECT` メソッドをサポートしています。

CSV、Json、Parquet、ORC などのファイル形式をサポートし、パラメータは File Table Valued ファンクション と同じです。

## 基本例

1. `fka/awesome-chatgpt-prompts` リポジトリから CSV データにアクセス

    ```sql
    SELECT COUNT(*) FROM
    HTTP(
        "uri" = "hf://datasets/fka/awesome-chatgpt-prompts/blob/main/prompts.csv",
        "format" = "csv"
    );
    ```
対応するデータファイル: https://huggingface.co/datasets/fka/awesome-chatgpt-prompts/blob/main/prompts.csv

2. Tableを作成し、`script`ブランチが指定された`stanfordnlp/imdb`リポジトリからJSONデータにアクセスします。その後、データをTableにインポートします。

    ```sql
    CREATE TABLE hf_table AS
    SELECT * FROM
    HTTP(
        "uri" = "hf://datasets/stanfordnlp/imdb@script/dataset_infos.json",
        "format" = "json"
    );
    ```
対応するデータファイル: https://huggingface.co/datasets/stanfordnlp/imdb/blob/script/dataset_infos.json

3. `main`ブランチを指定して`stanfordnlp/imdb`リポジトリからParquetファイルにアクセスします。また、ワイルドカードを使用して複数のパスにマッチさせます。

    ```sql
    SELECT * FROM
    HTTP(
        "uri" = "hf://datasets/stanfordnlp/imdb@main/*/*.parquet",
        "format" = "parquet"
    ) ORDER BY text LIMIT 1;
    ```
対応するデータファイル: https://huggingface.co/datasets/stanfordnlp/imdb/blob/main/plain_text/test-00000-of-00001.parquet

4. `main`ブランチを指定して`stanfordnlp/imdb`リポジトリからParquetファイルにアクセスします。また、ワイルドカードを使用して複数の再帰的ファイルにマッチさせます。その後、指定されたTableに挿入します。

    ```sql
    INSERT INTO hf_table
    SELECT * FROM
    HTTP(
        "uri" = "hf://datasets/stanfordnlp/imdb@main/**/test-00000-of-0000[1].parquet",
        "format" = "parquet"
    ) ORDER BY text LIMIT 1;
    ```
対応するデータファイル: https://huggingface.co/datasets/stanfordnlp/imdb/blob/main/plain_text/test-00000-of-00001.parquet

5. 認証が必要なファイルを解析する

    Hugging Faceアカウントから（`hf_`で始まる）Tokenを取得し、`http.header.Authorization`プロパティに追加してください。

    ```sql
    SELECT * FROM
    HTTP(
        "uri" = "hf://datasets/gaia-benchmark/GAIA/blob/main/2023/validation/metadata.level1.parquet",
        "format" = "parquet",
        "http.header.Authorization" = "Bearer hf_MWYzOJJoZEymb..."
    ) LIMIT 1\G
    ```
