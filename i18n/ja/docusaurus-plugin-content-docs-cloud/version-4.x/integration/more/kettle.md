---
{
  "title": "Kettle Doris Plugin",
  "description": "Kettle Doris Pluginは、KettleでStream Loadを通じて他のデータソースからDorisにデータを書き込むために使用されます。",
  "language": "ja"
}
---
# Kettle Doris Plugin

## Kettle Doris Plugin

[Kettle](https://pentaho.com/) Doris Pluginは、KettleでStream Loadを通じて他のデータソースからDorisにデータを書き込むために使用されます。

このプラグインはDorisのStream Load機能を使用してデータをインポートします。Kettleサービスと組み合わせて使用する必要があります。

## Kettleについて

KettleはオープンソースのETL（Extract, Transform, Load）ツールで、最初にPentahoによって開発されました。KettleはPentaho製品スイートのコアコンポーネントの1つで、主にデータ統合とデータ処理に使用され、様々なソースからのデータ抽出、データのクリーニングと変換、ターゲットシステムへのロードのタスクを簡単に完了できます。

詳細については、以下を参照してください：`https://pentaho.com/`

## ユーザーマニュアル

### Kettleのダウンロードとインストール
Kettleダウンロード先：https://pentaho.com/download/#download-pentaho
ダウンロード後、解凍してspoon.shを実行してkettleを起動します
自分でコンパイルすることも可能です。[Compilation Chapter](https://github.com/pentaho/pentaho-kettle?tab=readme-ov-file#how-to-build)を参照してください

### Kettle Doris Pluginのコンパイル

```shell
cd doris/extension/kettle
mvn clean package -DskipTests
```
コンパイル後、プラグインパッケージを解凍し、kettleのpluginsディレクトリにコピーしてください。

```shell
cd assemblies/plugin/target
unzip doris-stream-loader-plugins-9.4.0.0-343.zip
cp -r doris-stream-loader ${KETTLE_HOME}/plugins/
mvn clean package -DskipTests
```
### ジョブの構築
KettleのバッチローディングでDoris Stream Loaderを見つけ、ジョブを構築してください。
![create.png](https://raw.githubusercontent.com/apache/doris/refs/heads/master/extension/kettle/images/create.png)

「ジョブの実行開始」をクリックしてデータ同期を完了してください。
![running.png](https://raw.githubusercontent.com/apache/doris/refs/heads/master/extension/kettle/images/running.png)

### パラメータ説明

| Key | Default Value | Required | Comment |
|--------------|----------------| -------- |--------------------------------|
| Step name | -- | Y | ステップ名 |
| fenodes | -- | Y | Doris FE httpアドレス。複数のアドレスをサポートし、カンマで区切ります |
| Database | -- | Y | Doris書き込みデータベース |
| Target table | -- | Y | Dorisの書き込みテーブル |
| Username | -- | Y | Dorisにアクセスするためのユーザー名 |
| Password | -- | N | Dorisにアクセスするためのパスワード |
| Maximum number of rows for a single import | 10000 | N | 単一インポートの最大行数 |
| Maximum bytes for a single import | 10485760 (10MB) | N | 単一インポートの最大バイトサイズ |
| Number of import retries | 3 | N | インポート失敗後の再試行回数 |
| StreamLoad properties | -- | N | Streamloadリクエストヘッダー |
| Delete Mode | N | N | 削除モードを有効にするかどうか。デフォルトでは、Stream Loadは挿入操作を実行します。削除モードが有効になると、すべてのStream Load書き込みが削除操作になります。 |
