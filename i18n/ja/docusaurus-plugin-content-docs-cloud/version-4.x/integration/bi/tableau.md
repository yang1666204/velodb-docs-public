---
{
  "title": "Tableau",
  "description": "Tableauは、データ操作と美しいチャートを完璧に組み合わせた軽量なデータ可視化分析プラットフォームです。",
  "language": "ja"
}
---
# Tableau

VeloDBは公式のTableauコネクタを提供しています。このコネクタはMySQL JDBCドライバーに基づいてデータにアクセスします。

このコネクタは[TDVTフレームワーク](https://tableau.github.io/connector-plugin-sdk/docs/tdvt)によってテストされ、100%の合格率を達成しています。

このコネクタを使用すると、TableauはDorisデータベースとTableをデータソースとして統合できます。これを有効にするには、以下のセットアップガイドに従ってください：

- TableauとDorisコネクタのインストール
- TableauでのDorisデータソースの構成
- Tableauでの可視化の構築
- 接続と使用のヒント
- まとめ

## TableauとDorisコネクタのインストール

1. [Tableau desktop](https://www.tableau.com/products/desktop/download)をダウンロードしてインストールします。
2. [tableau-doris](https://velodb-bi-connector-1316291683.cos.ap-hongkong.myqcloud.com/Tableau/latest/doris_jdbc-latest.taco)カスタムコネクタコネクタ（doris_jdbc-***.taco）を取得します。
3. [MySQL JDBC](https://velodb-bi-connector-1316291683.cos.ap-hongkong.myqcloud.com/Tableau/latest/mysql-connector-j-8.3.0.jar)（バージョン8.3.0）を取得します。
4. コネクタとJDBCドライバーを配置する場所
   MacOS：
    - このパスを参照してください：`~/Documents/My Tableau Repository/Connectors`、`doris_jdbc-latest.taco`カスタムコネクタファイルを配置します（パスが存在しない場合は、必要に応じて手動で作成してください）。
    - JDBCドライバーjarの配置パス：`~/Library/Tableau/Drivers`
      Windows：
      `tableau_path`がWindowsでのTableauインストールディレクトリであると仮定します。
      通常のデフォルト：`tableau_path = C:\Program Files\Tableau`
    - このパスを参照してください：`%tableau_path%``\Connectors\`、`doris_jdbc-latest.taco`カスタムコネクタファイルを配置します（パスが存在しない場合は、必要に応じて手動で作成してください）。
    - JDBCドライバーjarの配置パス：`%tableau_path%\Drivers\`

次に、TableauでDorisデータソースを構成し、データ可視化の構築を開始できます！

## TableauでのDorisデータソースの構成

**JDBCとコネクタ**ドライバーをインストールして設定したので、Dorisのtpchデータベースに接続するTableauでのデータソース定義方法を見てみましょう。

1. 接続詳細を収集する

JDBC経由でDorisに接続するには、以下の情報が必要です：

| パラメータ          | 意味                                                                           | 例                        |
|--------------------|-----------------------------------------------------------------------------------|--------------------------------|
| サーバー             | データベースホスト                                                                     | 127.0.1.28                     |
| Port               | データベースMySQLポート                                                               | 9030                           |
| カタログ            | Doris Catalog、外部Tableとデータレイクのクエリ時に使用、詳細設定で設定 | internal                       |
| Database           | データベース名                                                                     | tpch                           |
| 認証     | データベース認証方式を選択：ユーザー名 / ユーザー名とパスワード           | Username and Password          |
| Username           | ユーザー名                                                                          | testuser                       |
| Password           | パスワード                                                                          |                                |
| Init SQL Statement | 初期SQL文                                                             | `select * from database.table` |

2. Tableauを起動します。（コネクタを配置する前に既に実行していた場合は、再起動してください。）
3. 左のメニューから、**サーバーへ**セクションの下にある**その他**をクリックします。利用可能なコネクタのリストで、**Doris JDBC by VeloDB**を検索します：

![find connector](/images/cloud/integration/bi/tableau/p01.png)

4. **Doris by VeloDB**をクリックすると、以下のダイアログが表示されます：

![dialog](/images/cloud/integration/bi/tableau/p02.png)

5. ダイアログでの指示に従って対応する接続情報を入力します。
6. オプションの詳細設定：

    - Initial SQLでプリセットSQLを入力してデータソースを定義できます
      ![Initial SQL](/images/cloud/integration/bi/tableau/p03.png)
    - 詳細設定では、Catalogを使用してデータレイクデータソースにアクセスできます。デフォルト値はinternalです。
      ![カタログ](/images/cloud/integration/bi/tableau/p04.png)
7. 上記の入力フィールドを完了したら、**サインイン**ボタンをクリックすると、新しいTableauワークブックが表示されるはずです：
   ![Sign In](/images/cloud/integration/bi/tableau/p05.png)

次に、Tableauでいくつかの可視化を構築できます！

## Tableauでの可視化の構築

データソースとしてTPC-Hデータを選択します。Doris TPC-Hデータソースの構築方法については[このドキュメント](../../benchmark/tpch.md)を参照してください。

TableauでDorisデータソースを構成したので、データを可視化しましょう。

1. customerTableとordersTableをワークブックにドラッグします。そして、それらのTable結合フィールドCustkeyを以下で選択します。

![table join](/images/cloud/integration/bi/tableau/p06.png)

2. nationTableをワークブックにドラッグし、customerTableとのTable結合フィールドNationkeyを選択します
   ![table join2](/images/cloud/integration/bi/tableau/p07.png)
3. customerTable、ordersTable、nationTableをデータソースとして関連付けたので、この関係を使用してデータに関する質問を処理できます。ワークブックの下部にある`Sheet 1`タブを選択してワークスペースに入ります。
   ![Sheet 1](/images/cloud/integration/bi/tableau/p08.png)
4. 年別のユーザー数のサマリーを知りたいとします。ordersからOrderDateを`列`エリア（水平フィールド）にドラッグし、次にcustomerからcustomer(count)を`行`にドラッグします。Tableauは以下の線グラフを生成します：
   ![chart1](/images/cloud/integration/bi/tableau/p09.png)

簡単な線グラフが完成しましたが、このデータセットはtpchスクリプトとデフォルトルールによって自動生成されており、実際のデータではありません。参考用ではなく、利用可能性をテストすることを目的としています。

5. 地域（国）と年別の平均注文金額（USD）を知りたいとします：
    - `新しいワークシート`タブをクリックして新しいシートを作成します
    - nationTableからNameを`行`にドラッグします
    - ordersTableからOrderDateを`列`にドラッグします

以下が表示されるはずです：
![chart2](/images/cloud/integration/bi/tableau/p10.png)

6. 注意：`Abc`の値は単なるプレースホルダー値です。そのマークに対する集計ロジックを定義していないため、Tableにメジャーをドラッグする必要があります。ordersTableからTotalpriceをTableの中央にドラッグします。デフォルトの計算はTotalpricesに対してSUMを実行することに注意してください：
   ![SUM on Totalprices](/images/cloud/integration/bi/tableau/p11.png)
7. `SUM`をクリックして`メジャー`を`平均`に変更します。
   ![sum](/images/cloud/integration/bi/tableau/p12.png)
8. 同じドロップダウンメニューから`書式設定`を選択し、`数値`を`通貨（標準）`に変更します：
   ![us](/images/cloud/integration/bi/tableau/p13.png)
9. 期待に合うTableを取得します：
   ![chart2](/images/cloud/integration/bi/tableau/p14.png)

これまでに、TableauはDorisに正常に接続され、データ分析と可視化ダッシュボードの作成が実現されました。

## 接続と使用のヒント

**パフォーマンス最適化**

- 実際のニーズに応じて、dorisデータベースとTableを合理的に作成し、時間でパーティション分割とバケット分割を行うことで、述語フィルタリングと大部分のデータ転送を効果的に削減できます
- Doris側でマテリアライズドビューを作成することで、適切なデータ事前集計を行うことができます。
- 更新の計算リソース消費とダッシュボードデータの適時性のバランスを取るため、合理的な更新計画を設定します

**セキュリティ設定**

- パブリックネットワークアクセスによって導入されるセキュリティリスクを回避するため、VPCプライベート接続の使用を推奨します。
- アクセスを制限するためにセキュリティグループを設定します。
- SSL/TLS接続などのアクセス方法を有効にします。
- Dorisユーザーアカウントの役割とアクセス権限を細分化し、過度な権限委任を回避します。
