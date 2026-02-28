---
{
  "title": "Power BI",
  "description": "Microsoft Power BIはApache Dorisからクエリを実行するか、データをメモリにロードすることができます。",
  "language": "ja"
}
---
Microsoft Power BI は Apache Doris からクエリしたり、データをメモリにロードしたりできます。

ダッシュボードと可視化を作成するためのWindows デスクトップアプリケーションである Power BI Desktop を使用できます。

このチュートリアルでは、以下のプロセスをガイドします：

- MySQL ODBC ドライバーのインストール
- Doris Power BI コネクターを Power BI Desktop にインストール
- Doris からデータをクエリして Power BI Desktop で可視化

## 前提条件

### Power BI のインストール

このチュートリアルでは、Windows コンピューターに Microsoft Power BI Desktop がインストールされていることを前提としています。Power BI Desktop は[ここ](https://www.microsoft.com/en-us/download/details.aspx?id=58494)からダウンロードしてインストールできます。

Power BI の最新バージョンに更新することをお勧めします。

### 接続情報

Apache Doris の接続詳細を収集してください

Apache Doris インスタンスに接続するには、以下の詳細が必要です：

| Parameter | デスクリプション | Example                      |
| ---- | ---- |------------------------------|
| **Doris Data Source** | データベース接続文字列、ホスト + ポート | 127.0.1.28:9030              |
| **Database** | データベース名 | test_db                      |
| **Data Connectivity Mode** | データ接続モード、Import と DirectQuery が含まれます |      DirectQuery                        |
| **SQL Statement** | Database を含む必要がある SQL 文、Import モードのみ | select * from database.table |
| **User Name** | ユーザー名 | admin                        |
| **Password** | パスワード | xxxxxx                       |

## Power BI Desktop

Power BI Desktop でデータのクエリを開始するには、以下の手順を完了してください：

1. MySQL ODBC ドライバーのインストール
2. Doris コネクターを見つける
3. Doris に接続
4. データをクエリして可視化

### ODBC ドライバーのインストール

[MySQL ODBC](https://downloads.mysql.com/archives/c-odbc/) をダウンロードしてインストールし、設定してください（バージョン 5.3）。

提供された `.msi` インストーラーを実行し、ウィザードに従ってください。

![](/images/ecomsystem/powerbi/WYRLb9JmcoEHeuxr41Ec8yMQnff.png)

![](/images/ecomsystem/powerbi/LYh9bi780o3DaCxwF3BcuPrknlh.png)

![](/images/ecomsystem/powerbi/E1i7buBzHoquRCxT6VAc1FjCnNf.png)

インストール完了

![](/images/ecomsystem/powerbi/PURIbSCFhoara3xodBBc5xaNnjc.png)

#### ODBC ドライバーの確認

ドライバーのインストールが完了した後、以下のように成功したことを確認できます：

スタートメニューで ODBC と入力し、「ODBC Data Sources **(64-bit)**」を選択してください。

![](/images/ecomsystem/powerbi/QhVVbjalNoIwvdxd1u7cX3UAnEf.png)

MySQL ドライバーがリストされていることを確認してください。

![](/images/ecomsystem/powerbi/OzVSbojxto9SpRxP3sLcnqHmnme.png)

### Doris コネクターのインストール

Power BI カスタムコネクターの認証チャネルは現在クローズされているため、Doris カスタムコネクターは未認証です。未認証のコネクターについては、以下のように設定してください（[https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-connector-extensibility#custom-connectors](https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-connector-extensibility#custom-connectors)）：

1. `power_bi_path` を Windows オペレーティングシステムの Power BI Desktop のディレクトリとすると、デフォルトは通常：`power_bi_path = C:\Program Files\Power BI Desktop` です。このパス `%power_bi_path%\Custom Connectors folder` を参照し、[Doris.mez](https://velodb-bi-connector-1316291683.cos.ap-hongkong.myqcloud.com/PowerBI/latest/Doris.mez) カスタムコネクターファイルを配置してください（パスが存在しない場合は、必要に応じて手動で作成してください）。
2. Power BI Desktop で、`File` > `Options and settings` > `Options` > `Security` を選択してください。`Data Extensions` の下で、`(Not Recommended) Allow any extension to load without validation or warning` をチェックして、未認証コネクターの制限をバイパスしてください。

まず、`File` を選択してください

![](/images/ecomsystem/powerbi/YeQDbcIoQoI5RtxU0mjcNXuJnrg.png)

次に `Options and settings` > `Options` を選択してください

![](/images/ecomsystem/powerbi/LV6Tbdw54o5pqtxC2bCctM30nbe.png)

`Options` ダイアログで、`GLOBAL` > `Security` に移動してください。`Data Extensions` の下で、

`(Not Recommended) Allow any extension to load without validation or warning` をチェックしてください。

![](/images/ecomsystem/powerbi/Tg5cbS75HoBGIMxpcKScJ9WXnRg.png)

`OK` をクリックしてから、Power BI Desktop を再起動してください。

### Doris コネクターを見つける

1. Power BI Desktop を起動してください
2. Power BI Desktop のスタート画面で、「New report」をクリックしてください。既にローカルレポートがある場合は、既存のレポートを開くことができます。

![](/images/ecomsystem/powerbi/FuXNb5hb2oOq7cxNpPEcR1dKnyg.png)

3. 「Get Data」をクリックし、ポップアップウィンドウで Doris データベースを選択してください。

![](/images/ecomsystem/powerbi/G9UWbT1P6otb53xlgj4cljUInz1.png)

### Doris に接続

コネクターを選択し、Doris インスタンスの認証情報を入力してください：

- Doris Data Source（必須）- インスタンスドメイン/アドレスまたは host:port
- Database（必須）- データベース名
- SQL statement - 事前実行された SQL 文（'Import' モードでのみ利用可能）
- Data connectivity mode - DirectQuery/Import

![](/images/ecomsystem/powerbi/KiM2bVPWhoYBg5xGQUQcJFNcntg.png)

**注意**

Doris を直接クエリするために DirectQuery を選択することをお勧めします。

少量のデータを扱うユースケースがある場合は、Import モードを選択でき、データセット全体が Power BI にロードされます。

- ユーザー名とパスワードを指定してください

![](/images/ecomsystem/powerbi/KZXxbDPTBo2O3FxqgZdcE9I6ndc.png)

### データのクエリと可視化

最終的に、ナビゲータービューでデータベースとTableが表示されるはずです。希望するTableを選択し、「Load」をクリックして、Table構造をロードし、Apache Doris からデータをプレビューしてください。

![](/images/ecomsystem/powerbi/J7xObwqSYoTdTQx3hjgcAjQznS5.png)

インポートが完了した後、Doris データは通常通り Power BI でアクセス可能になり、必要な統計コンパスを設定してください。

![](/images/ecomsystem/powerbi/JvIgbbyo2oWPlgxcb6Cct5ssnld.png)

## Power BI での可視化の構築

データソースとして TPC-H データを選択しました。Doris TPC-H データソースの構築手順については、このドキュメントを参照してください。
Power BI で Doris データソースを設定したので、データを可視化しましょう...

各地域の注文収益統計を知る必要があるとします。この要件に基づいてダッシュボードを構築します。

1. まず、Tableモデルの関係を作成してください。Model ビューをクリックしてください。

![](/images/ecomsystem/powerbi/V7PsbP3oKoJpLjxK5HdcPsnLnKf.png)

2. 必要に応じてこれらの4つのTableを同じ画面にドラッグアンドドロップで配置し、関連するフィールドをドラッグアンドドロップしてください。

![](/images/ecomsystem/powerbi/FZL5b2kJcoifIaxI7Eocpak7nvf.png)

![](/images/ecomsystem/powerbi/UxL2b1OV2or1LhxZjHsc0JG7ntb.png)

4つのTable間の関係は以下の通りです：

- **customer** ：c_nationkey  --  **nation** : n_nationkey
- **customer** ：c_custkey  --  **orders** : o_custkey
- **nation** : n_regionkey  --  **region** : r_regionkey

3. 関連付け後の結果は以下の通りです：

![](/images/ecomsystem/powerbi/LomhbQTPPoZr58xp8f3cxcTen8d.png)

4. Report ビューワークベンチに戻り、ダッシュボードを構築してください。
5. `orders` Tableから `o_totalprice` フィールドをダッシュボードにドラッグしてください。

![](/images/ecomsystem/powerbi/MB34bks6woK3mDx0eVccivKEngc.png)

6. `region` Tableから `r_name` フィールドを列 X にドラッグしてください。

![](/images/ecomsystem/powerbi/JxpJbihDHoHGwixjWQScNyxvn4e.png)

7. 期待されるダッシュボードコンテンツが表示されるはずです。

![](/images/ecomsystem/powerbi/CfGWb6oaYoj4LyxpPIGcz3Binzb.png)

8. ワークベンチの左上にある保存ボタンをクリックして、作成した統計コンパスをローカルマシンに保存してください。

![](/images/ecomsystem/powerbi/WozGbmqAOoP2mqxq2NmcJRFyntc.png)

この時点で、Power BI を Apache Doris に正常に接続し、データ分析とダッシュボード作成を実装しました。
