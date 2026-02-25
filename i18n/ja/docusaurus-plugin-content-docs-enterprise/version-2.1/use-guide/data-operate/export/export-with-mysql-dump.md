---
{
  "title": "MySQL Dumpの使用",
  "description": "Dorisはバージョン0.15以降、mysqldumpツールを通じてデータやテーブル構造のエクスポートをサポートしています。",
  "language": "ja"
}
---
Dorisはバージョン0.15以降、`mysqldump`ツールを通じてデータまたはテーブル構造のエクスポートをサポートしています。

## 例

### エクスポート

1. testデータベースのtable1テーブルをエクスポート: `mysqldump -h127.0.0.1 -P9030 -uroot --no-tablespaces --databases test --tables table1`

2. testデータベースのtable1テーブル構造をエクスポート: `mysqldump -h127.0.0.1 -P9030 -uroot --no-tablespaces --databases test --tables table1 --no-data`

3. test1、test2データベースのすべてのテーブルをエクスポート: `mysqldump -h127.0.0.1 -P9030 -uroot --no-tablespaces --databases test1 test2`

4. すべてのデータベースとテーブルをエクスポート: `mysqldump -h127.0.0.1 -P9030 -uroot --no-tablespaces --all-databases`
その他の使用パラメータについては、`mysqldump`のマニュアルを参照してください。

### インポート

`mysqldump`でエクスポートした結果はファイルにリダイレクトでき、そのファイルは`source filename.sql`コマンドを通じてDorisにインポートできます。

## 注意

1. Dorisにはmysqlのtablespaceの概念がないため、`mysqldump`を使用する際は`--no-tablespaces`パラメータを追加してください。

2. mysqldumpを使用したデータおよびテーブル構造のエクスポートは、開発・テスト時またはデータ量が少ない場合にのみ使用してください。大量のデータがある本番環境では使用しないでください。
