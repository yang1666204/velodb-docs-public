---
{
  "title": "Metabase",
  "description": "Metabaseは、シンプルで使いやすいデータ分析と可視化機能を提供し、豊富なデータソース接続をサポートし、インタラクティブなダッシュボードの迅速な構築を可能にするオープンソースのビジネスインテリジェンスツールです。",
  "language": "ja"
}
---
Metabaseは、シンプルで使いやすいデータ分析・可視化機能を提供し、豊富なデータソース接続をサポートし、インタラクティブなダッシュボードの迅速な構築を可能にするオープンソースのビジネスインテリジェンスツールです。主要な機能には、ユーザーフレンドリーなインターフェース、使いやすさ、セルフサービス分析のサポート、可視化ダッシュボード作成、データドリルダウン探索、SQLクエリとデータエクスポート用の統合SQLクエリエディタが含まれます。

Metabase Apache Doris Driverを使用することで、MetabaseをApache Dorisデータベースに接続し、DorisのデータとDorisの内部・外部データの両方をクエリおよび可視化できます。

このドライバーにより、MetabaseはApache DorisデータベースとTableをデータソースとして統合できます。この機能を有効にするには、以下のセットアップガイドに従ってください：

- ドライバーのインストールと設定
- MetabaseでのApache Dorisデータソースの設定
- Metabaseでの可視化の構築
- 接続と使用のヒント

## MetabaseとDoris Driverのインストール

### 前提条件

1. Metabaseバージョン0.48.0以降をダウンロードしてインストールします。詳細については、[Metabase Installation Documentation](https://www.metabase.com/docs/latest/installation-and-operation/installing-metabase)を参照してください。
2. Apache Dorisクラスターを準備します。

### Doris Driverのインストール

まず、最新の[metabase-doris-driver](https://velodb-bi-connector-1316291683.cos.ap-hongkong.myqcloud.com/Metabase/latest/doris.metabase-driver.jar)をダウンロードする必要があります。

次に、ドライバーをインストールします。インストール方法は、Metabaseのデプロイ方法によって異なります：

#### Metabase標準デプロイメント

1. ドライバーをダウンロードします

2. Metabaseプラグインディレクトリを作成します（存在しない場合）：

```bash
mkdir -p $path_metabase/plugins
```
3. JARファイルをpluginディレクトリにコピーします：

```bash
cp doris.metabase-driver.jar $path_metabase/plugins
```
4. Metabaseサービスを再起動します

#### Metabase Docker Deployment

MetabaseがDockerを使用して起動される場合、`doris.metabase-driver.jar`をマウントして起動することを推奨します。Dockerコンテナ内のプラグインパスは`/plugins/`です。

1. ドライバーをダウンロードします

2. 以下のコマンドを使用してMetabaseを起動します：

```bash
docker run -d -p 3000:3000 --name metabase  -v $host_path/doris.metabase-driver.jar:/plugins/doris.metabase-driver.jar  metabase/metabase
```
## MetabaseでのDorisデータソースの設定

**Metabase**と**metabase-doris-driver**がインストールされたので、Dorisのtpchデータベースに接続するMetabaseでのデータソースの定義方法を見てみましょう。

### 接続パラメータの説明

Apache Dorisに接続する際に設定する必要があるパラメータは以下の通りです：

| パラメータ | Meaning | Example |
|------|------|------|
| **Display Name** | データソース表示名 | Doris-TPCH |
| **Host** | Doris FEノードアドレス | 127.0.0.1 |
| **Port** | Doris Query Port（MySQLプロトコルポート） | 9030 |
| **カタログ name** | Catalog名（オプション、デフォルトはinternal） | internal |
| **Database name** | データベース名（必須） | tpch |
| **Username** | ユーザー名 | root |
| **Password** | パスワード | your_password |

**Database Name形式の説明：**

- **Internal Tables**：`tpch`のようにデータベース名を直接入力します。システムは自動的に`internal` catalogを使用します。
- **External Tables/Data Lake**：Catalog設定を入力します。内部Tableのみをリンクする場合、この項目は必要ありません。

### 設定手順

1. Metabaseを開始してログインします。

2. 右上のギアアイコンをクリックし、**Admin Settings**を選択します。

![Metabase Admin Settings](/images/cloud/integration/bi/metabase/metabase-01.png)

3. 左側のメニューで**Databases**を選択し、右上の**Add database**ボタンをクリックします。

![Add database](/images/cloud/integration/bi/metabase/metabase-02.png)

4. **Database type**ドロップダウンメニューで**Apache Doris**を選択します。

![Select Apache Doris](/images/cloud/integration/bi/metabase/metabase-03.png)

5. 接続情報を入力します：

- **Display name**: Doris-TPCH
- **Host**: 127.0.0.1
- **Port**: 9030
- **Database name**: tpch
- **Username**: admin
- **Password**: ******

![Fill in connection information](/images/cloud/integration/bi/metabase/metabase-04.png)

6. **Save**をクリックして設定を保存します。

7. Metabaseは自動的に接続をテストし、データベースメタデータを同期します。接続が成功すると、成功メッセージが表示されます。

![Connection successful](/images/cloud/integration/bi/metabase/metabase-05.png)

この時点でデータソースの設定は完了です！次に、Metabaseで可視化を構築できます。

## Metabaseでの可視化の構築

データソースとしてTPC-Hデータを選択します。Doris TPC-Hデータソースの構築手順については、[このドキュメント](../../benchmark/tpch.md)を参照してください。

MetabaseでDorisデータソースを設定したので、データを可視化してみましょう...

コスト分析のために、異なる輸送方法における時系列での注文金額成長曲線を分析する必要があるとします。

### Questionの作成

1. ホームページの右上の**New +**ボタンをクリックし、**Question**を選択します。

![Create a new question](/images/cloud/integration/bi/metabase/metabase-06.png)

2. データソースを選択します：
   - **Database**: Doris TPCH
   - **Table**: lineitem

![Select the table](/images/cloud/integration/bi/metabase/metabase-07.png)

### SQLを使用したカスタムメトリクスの構築

売上を計算するには、カスタムSQL式を使用する必要があります：

1. 右上の**view sql**スイッチをクリックし、**convert this question to SQL**をクリックしてSQLを編集します。

![Switch to SQL mode](/images/cloud/integration/bi/metabase/metabase-08.png)

2. 以下のSQLクエリを入力します：

```sql
SELECT 
  DATE_FORMAT(l_shipdate, '%Y-%m') AS ship_month,
  l_shipmode,
  SUM(l_extendedprice * (1 - l_discount)) AS revenue
FROM lineitem
WHERE l_shipdate >= '1995-01-01' 
  AND l_shipdate < '1997-01-01'
GROUP BY 
  DATE_FORMAT(l_shipdate, '%Y-%m'),
  l_shipmode
ORDER BY ship_month, l_shipmode
```
3. 右下角の**Visualize**ボタンをクリックして結果を表示します。

![View Results](/images/cloud/integration/bi/metabase/metabase-09.png)


### 可視化チャートの設定

1. デフォルトの表示はTableです。左下角の**Visualization**ボタンをクリックして**Line**チャートタイプを選択します。

![Select Line Chart](/images/cloud/integration/bi/metabase/metabase-10.png)

2. 必要に応じてチャートパラメータを設定します（metabaseは以下のように自動設定します）：
   - **X軸**: ship_month（出荷月）
   - **Y軸**: revenue（売上）
   - **Series**: l_shipmode（出荷モード）

3. チャートスタイルをカスタマイズします：
   - **Settings**アイコンをクリックして色、ラベル、凡例位置などを調整します。
   - **Display**タブで軸タイトル、値フォーマットなどを設定できます。

4. チャート設定後、右上角の**Save**をクリックします。

5. 課題名を入力します：**my-tpch**、保存先のコレクションを選択します。

![Naming the issue](/images/cloud/integration/bi/metabase/metabase-11.png)

### ダッシュボードの作成

1. **+ New** → **Dashboard**をクリックして新しいダッシュボードを作成します。ダッシュボード名を入力します：**my-tpch**

![Creating a Dashboard](/images/cloud/integration/bi/metabase/metabase-12.png)

2. **Add a chart**をクリックして保存された質問をダッシュボードに追加します。

![Adding a Question](/images/cloud/integration/bi/metabase/metabase-13.png)

3. チャートの位置とサイズを調整し、右上角の**Save**をクリックしてダッシュボードを保存します。

![Saving the Dashboard](/images/cloud/integration/bi/metabase/metabase-14.png)

これで、MetabaseがApache Dorisに正常に接続され、データ分析と可視化ダッシュボードの作成が実装されました！

## 高度な機能

### Catalogsを使用した外部データへのアクセス

Dorisはマルチcatalog機能をサポートしており、外部データソースへのクエリとクロスデータソースクエリを可能にします。Metabaseで使用する際：

1. Links設定インターフェースで`カタログ`を設定し、そのcatalog下の外部データベースを`Database`で設定します。例：  
   `catalog: hive_catalog`, `database: warehouse` - hive_catalogという名前のwarehouseデータベースにアクセス

![Configuring catalog](/images/cloud/integration/bi/metabase/metabase-15.png)

2. または、SQLクエリでCatalogを明示的に指定します：

```sql
SELECT * FROM hive.warehouse.orders LIMIT 100;
```
### Parameterized Queriesの使用

MetabaseはSQLクエリでの変数の使用をサポートしており、インタラクティブなダッシュボードを簡単に作成できます：

```sql
SELECT 
  l_shipmode,
  SUM(l_extendedprice * (1 - l_discount)) AS revenue
FROM lineitem
WHERE l_shipdate BETWEEN {{start_date}} AND {{end_date}}
  AND l_shipmode = {{ship_mode}}
GROUP BY l_shipmode
```
保存後、ダッシュボードでドロップダウンメニューや日付ピッカーを使用してデータを動的にフィルタリングできます。

### パフォーマンス最適化の推奨事項

1. **パーティション Clippingを使用する**: WHERE句にパーティションカラムのフィルタ条件を追加します。

   ```sql
   WHERE date >= '2024-01-01' AND date < '2024-02-01'
   ```
2. **Materialized Viewsの活用:** 複雑な集約クエリに対しては、DorisでMaterialized Viewsを作成することで、クエリプロセスを高速化できます。

3. **結果セットサイズの制御:** LIMITを使用して返される行数を制限し、一度に大量のデータを読み込むことを避けます。

4. **クエリキャッシング:** Metabaseは自動的にクエリ結果をキャッシュします。適切なキャッシュ時間を設定することで、パフォーマンスを向上させることができます。

### 接続と使用のヒント

- **ドライバーインストール:** `doris.metabase-driver.jar`がMetabaseの`plugins`ディレクトリに配置されていることを確認し、Metabaseを再起動してください。
- **タイムゾーン設定:** タイムゾーンの問題が発生した場合は、JDBC接続文字列に`serverTimezone=Asia/Shanghai`を追加してください。
- **パーティションTableの最適化:** 適切なDorisパーティションTableを作成し、時間で分割してバケット化することで、クエリでスキャンされるデータ量を効果的に削減できます。
- **ネットワーク接続:** パブリックネットワークアクセスによって生じるセキュリティリスクを避けるため、VPCプライベート接続の使用を推奨します。
- **アクセス制御:** Dorisユーザーアカウントのロールとアクセス権限を細かく調整し、最小権限の原則に従ってください。
- **メタデータ同期:** Doris... Table構造が変更された場合は、Metabase管理ページで「Sync database schema now」をクリックして手動で同期してください。
- **パフォーマンス監視**: 遅いクエリについては、Dorisで`SHOW QUERY PROFILE`を使用してパフォーマンスボトルネックを分析できます。

### データタイプ表示異常

- 最新バージョンのDoris Driverを使用していることを確認してください。
- Doris largeintタイプはSQLで明示的に変換する必要があります。

  ```sql
  SELECT CAST(large_int_col AS STRING) FROM table
  ```
