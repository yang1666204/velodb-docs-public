---
{
  "title": "Power BI",
  "description": "Power BIは、Excel、SQL Server、Azure...を含む複数のデータソースに接続できるソフトウェアサービスとアプリケーションコネクターのコレクションです。",
  "language": "ja"
}
---
# Power BI

Microsoft Power BIはApache Dorisからクエリを実行したり、データをメモリに読み込んだりできます。

ダッシュボードや可視化の作成用のWindowsデスクトップアプリケーションであるPower BI Desktopを使用できます。

このチュートリアルでは、以下のプロセスを説明します：

- MySQL ODBCドライバのインストール
- Doris Power BIコネクタのPower BI Desktopへのインストール
- DorisからPower BI Desktopでデータを可視化するためのクエリ実行

## 前提条件

### Power BIのインストール

このチュートリアルでは、Microsoft Power BI DesktopがWindowsコンピュータにインストールされていることを前提とします。Power BI Desktopは[こちら](https://www.microsoft.com/en-us/download/details.aspx?id=58494)からダウンロードしてインストールできます。

Power BIの最新バージョンへの更新を推奨します。

### 接続情報

Apache Dorisの接続詳細を収集してください

Apache Dorisインスタンスに接続するには、以下の詳細が必要です：

| Parameter | Description | Example                      |
| ---- | ---- |------------------------------|
| **Doris Data Source** | データベース接続文字列、host + port | 127.0.1.28:9030              |
| **Database** | データベース名 | test_db                      |
| **Data Connectivity Mode** | データ接続モード、ImportとDirectQueryを含む |      DirectQuery                        |
| **SQL Statement** | Databaseを含む必要があるSQL文、Importモードのみ | select * from database.table |
| **User Name** | ユーザー名 | admin                        |
| **Password** | パスワード | xxxxxx                       |

## Power BI Desktop

Power BI Desktopでデータのクエリを開始するには、以下の手順を完了してください：

1. MySQL ODBCドライバのインストール
2. Dorisコネクタの検索
3. Dorisへの接続
4. データのクエリと可視化

### ODBCドライバのインストール

[MySQL ODBC](https://downloads.mysql.com/archives/c-odbc/)をダウンロードしてインストールし、設定してください（バージョン5.3）。

提供されている`.msi`インストーラを実行し、ウィザードに従ってください。

![installer1](/images/cloud/integration/bi/powerbi/WYRLb9JmcoEHeuxr41Ec8yMQnff.png)

![installer2](/images/cloud/integration/bi/powerbi/LYh9bi780o3DaCxwF3BcuPrknlh.png)

![installer3](/images/cloud/integration/bi/powerbi/E1i7buBzHoquRCxT6VAc1FjCnNf.png)

インストール完了

![completed](/images/cloud/integration/bi/powerbi/PURIbSCFhoara3xodBBc5xaNnjc.png)

#### ODBCドライバの確認

ドライバのインストールが完了したら、以下の手順で成功したかどうかを確認できます：

スタートメニューでODBCと入力し、「ODBC データソース **(64-bit)**」を選択してください。

![ODBC](/images/cloud/integration/bi/powerbi/QhVVbjalNoIwvdxd1u7cX3UAnEf.png)

MySQLドライバがリストに表示されていることを確認してください。

![driver](/images/cloud/integration/bi/powerbi/OzVSbojxto9SpRxP3sLcnqHmnme.png)

### Dorisコネクタのインストール

Power BIカスタムコネクタの認証チャンネルは現在閉鎖されているため、Dorisカスタムコネクタは未認証です。未認証コネクタの場合は、以下のように設定してください（[https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-connector-extensibility#custom-connectors](https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-connector-extensibility#custom-connectors)）：

1. `power_bi_path`をWindowsオペレーティングシステムのPower BI Desktopディレクトリとすると、通常のデフォルトは：`power_bi_path = C:\Program Files\Power BI Desktop`です。このパス`%power_bi_path%\Custom Connectors folder`を参照し、[Doris.mez](https://velodb-bi-connector-1316291683.cos.ap-hongkong.myqcloud.com/PowerBI/latest/Doris.mez)カスタムコネクタファイルを配置してください（パスが存在しない場合は、必要に応じて手動で作成してください）。
2. Power BI Desktopで、`File` > `Options and settings` > `Options` > `Security`を選択してください。`Data Extensions`で、`(Not Recommended) Allow any extension to load without validation or warning`をチェックして、未認証コネクタの制限をバイパスしてください。

最初に、`File`を選択してください

![choose](/images/cloud/integration/bi/powerbi/YeQDbcIoQoI5RtxU0mjcNXuJnrg.png)

次に`Options and settings` > `Options`を選択してください

![choose2](/images/cloud/integration/bi/powerbi/LV6Tbdw54o5pqtxC2bCctM30nbe.png)

`Options`ダイアログで、`GLOBAL` > `Security`に移動してください。`Data Extensions`で、

`(Not Recommended) Allow any extension to load without validation or warning`をチェックしてください。

![choose3](/images/cloud/integration/bi/powerbi/Tg5cbS75HoBGIMxpcKScJ9WXnRg.png)

`OK`をクリックし、Power BI Desktopを再起動してください。

### Dorisコネクタの検索

1. Power BI Desktopを起動してください
2. Power BI Desktopのスタート画面で、「New report」をクリックしてください。ローカルレポートがすでにある場合は、既存のレポートを開くことができます。

![report](/images/cloud/integration/bi/powerbi/FuXNb5hb2oOq7cxNpPEcR1dKnyg.png)

3. 「Get Data」をクリックし、ポップアップウィンドウでDorisデータベースを選択してください。

![database](/images/cloud/integration/bi/powerbi/G9UWbT1P6otb53xlgj4cljUInz1.png)

### Dorisへの接続

コネクタを選択し、Dorisインスタンスの認証情報を入力してください：

- Doris Data Source（必須） - インスタンスのドメイン/アドレスまたはhost:port。
- Database（必須） - データベース名。
- SQL statement - 事前実行されるSQL文（'Import'モードでのみ利用可能）
- Data connectivity mode - DirectQuery/Import

![credentials](/images/cloud/integration/bi/powerbi/KiM2bVPWhoYBg5xGQUQcJFNcntg.png)

**注意**

Dorisを直接クエリするためにDirectQueryを選択することを推奨します。

少量のデータのユースケースがある場合は、Importモードを選択でき、データセット全体がPower BIに読み込まれます。

- ユーザー名とパスワードを指定してください

![DirectQuery](/images/cloud/integration/bi/powerbi/KZXxbDPTBo2O3FxqgZdcE9I6ndc.png)

### データのクエリと可視化

最後に、ナビゲータビューでデータベースとテーブルが表示されるはずです。目的のテーブルを選択し、「Load」をクリックしてテーブル構造を読み込み、Apache Dorisからデータをプレビューしてください。

![load](/images/cloud/integration/bi/powerbi/J7xObwqSYoTdTQx3hjgcAjQznS5.png)

インポートが完了したら、DorisデータがPower BIで通常通りアクセス可能になります。必要な統計コンパスを設定してください。

![complete](/images/cloud/integration/bi/powerbi/JvIgbbyo2oWPlgxcb6Cct5ssnld.png)

## Power BIでの可視化の構築

データソースとしてTPC-Hデータを選択しました。Doris TPC-Hデータソースの構築手順については、[このドキュメント](../../benchmark/tpch)を参照してください。
Power BIでDorisデータソースを設定したので、データを可視化しましょう...

各地域の注文収益統計を知る必要があると仮定して、この要件に基づいてダッシュボードを構築します。

1. 最初に、テーブルモデルの関係を作成してください。Model viewをクリックしてください。

![First](/images/cloud/integration/bi/powerbi/V7PsbP3oKoJpLjxK5HdcPsnLnKf.png)

2. 必要に応じて4つのテーブルを同じ画面にドラッグアンドドロップで配置し、関連するフィールドをドラッグアンドドロップしてください。

![related1](/images/cloud/integration/bi/powerbi/FZL5b2kJcoifIaxI7Eocpak7nvf.png)

![related2](/images/cloud/integration/bi/powerbi/UxL2b1OV2or1LhxZjHsc0JG7ntb.png)

4つのテーブル間の関係は以下の通りです：

- **customer** ：c_nationkey  --  **nation** : n_nationkey
- **customer** ：c_custkey  --  **orders** : o_custkey
- **nation** : n_regionkey  --  **region** : r_regionkey

3. 関連付け後の結果は以下の通りです：

![results](/images/cloud/integration/bi/powerbi/LomhbQTPPoZr58xp8f3cxcTen8d.png)

4. Report viewワークベンチに戻り、ダッシュボードを構築してください。
5. `orders`テーブルから`o_totalprice`フィールドをダッシュボードにドラッグしてください。

![dashboard1](/images/cloud/integration/bi/powerbi/MB34bks6woK3mDx0eVccivKEngc.png)

6. `region`テーブルから`r_name`フィールドを列Xにドラッグしてください。

![dashboard2](/images/cloud/integration/bi/powerbi/JxpJbihDHoHGwixjWQScNyxvn4e.png)

7. 期待されるダッシュボードコンテンツが表示されるはずです。

![dashboard3](/images/cloud/integration/bi/powerbi/CfGWb6oaYoj4LyxpPIGcz3Binzb.png)

8. ワークベンチの左上にある保存ボタンをクリックして、作成した統計コンパスをローカルマシンに保存してください。

![end](/images/cloud/integration/bi/powerbi/WozGbmqAOoP2mqxq2NmcJRFyntc.png)

これで、Power BIをApache Dorisに正常に接続し、データ分析とダッシュボード作成を実装しました。
