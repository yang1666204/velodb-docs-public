---
{
  "title": "Tableau",
  "description": "Tableau で Apache Doris へのアクセスを有効にするには、Tableau の公式 MySQL コネクタがニーズを満たすことができます。",
  "language": "ja"
}
---
TableauでApache Dorisにアクセスするには、TableauのオフィシャルMySQLコネクタをご利用いただけます。このコネクタはMySQL JDBCドライバを使用してデータにアクセスします。

MySQLコネクタを通じて、TableauはApache DorisのデータベースとTableをデータソースとして統合できます。この機能を有効にするには、以下のセットアップガイドに従ってください：

- 使用前の必要なセットアップ
- TableauでのApache Dorisデータソースの設定
- Tableauでの可視化の構築
- 接続と使用のヒント

## Tableauとtドライバのインストール

1. [Tableau desktop](https://www.tableau.com/products/desktop/download)をダウンロードしてインストールします。
2. [MySQL JDBC](https://velodb-bi-connector-1316291683.cos.ap-hongkong.myqcloud.com/Tableau/latest/mysql-connector-j-8.3.0.jar)（バージョン8.3.0）を取得します。
3. JDBCドライバ配置パス
    - macOS: JDBCドライバJARファイルの配置パス: `~/Library/Tableau/Drivers`
    - Windows: `tableau_path`をWindowsオペレーティングシステム上のTableauインストールディレクトリとすると、通常デフォルトは: `tableau_path = C:\Program Files\Tableau`、JDBCドライバJARファイルの配置パスは: `%tableau_path%\Drivers\`

次に、TableauでDorisデータソースを設定し、データ可視化の構築を開始できます！

## TableauでのDorisデータソースの設定

**JDBCとConnector**ドライバをインストールしてセットアップしたので、Dorisのtpchデータベースに接続するTableauのデータソースを定義する方法を見てみましょう。

1. 接続詳細の収集

JDBC経由でApache Dorisに接続するには、以下の情報が必要です：

| Parameter            | Meaning                                                                 | Example                        |
| -------------------- | -------------------------------------------------------------------- | ----------------------------- |
| サーバー               | Database host                                                           | 127.0.1.28                    |
| Port                 | Database MySQL port                                                     | 9030                          |
| Database             | Database name                                                           | tpch                          |
| Username             | Username                                                                 | testuser                      |
| Password             | Password                                                                 | Leave blank                   |
| Init SQL Statement   | Initial SQL statement                                                    | `select * from database.table` |

2. Tableauを起動します。（既に実行中の場合は、再起動してください。）
3. 左側のメニューから、**To a サーバー**セクションの下の**More**をクリックします。利用可能なコネクタのリストで**mysql**を検索します。

![](/images/ecomsystem/tableau/QSrsbadm0oEiuHxyGv3clFhTnLh.png)

4. **MySQL**をクリックすると、以下のダイアログボックスが表示されます：

![](/images/ecomsystem/tableau/DN47bCp5ZovHCmxH0DAc3fBonR3.png)

5. ダイアログボックスのプロンプトに従って、対応する接続情報を入力します。
6. 上記の入力ボックスを完成させた後、**Sign In**ボタンをクリックします。新しいTableauワークブックが表示されるはずです。
   ![](/images/ecomsystem/tableau/LJK9bPMptoAGjGxzoCtcY8Agnye.png)

次に、Tableauでいくつかの可視化を構築できます！

## Tableauでの可視化の構築

データソースとしてTPC-Hデータを選択しました。Doris TPC-Hデータソースの構築手順については、この文書を参照してください。

TableauでDorisデータソースを設定したので、データを可視化してみましょう。

1. `customer`と`orders`Tableをワークブックにドラッグします。次に、下のTable関連付けのために`Custkey`フィールドを選択します。
   ![](/images/ecomsystem/tableau/ZJuBbDBc5o2Gnyxhn7icv30xnXw.png)
2. `nation`Tableをワークブックにドラッグし、`Nationkey`フィールドを選択して`customer`Tableと関連付けます。
   ![](/images/ecomsystem/tableau/GPXQbcNUnobHtLx5sIocMHAwn2d.png)
3. これで`customer`、`orders`、`nation`Tableをデータソースとしてリンクしたので、この関係を使用してデータ関連の問題に取り組むことができます。ワークベンチにアクセスするには、ワークブック下部の`Sheet 1`タブを選択します。
   ![](/images/ecomsystem/tableau/FsHmbUOKIoFT5YxWmGecLArLnjd.png)
4. 各年の総ユーザー数を知りたいとします。ordersからOrderDateをColumns領域（水平フィールド）にドラッグし、次にcustomerからcustomer(count)をRowsにドラッグします。Tableauは以下の折れ線グラフを生成します：
   ![](/images/ecomsystem/tableau/I9SCbCFzoo7TgLx6BP1cHdtRnWc.png)

シンプルな折れ線グラフが完成しました。ただし、このデータセットは実際のデータではなく、tpchスクリプトとデフォルトルールによって自動生成されたもので、使用可能性をテストすることを目的としています。

5. 地域（国）と年別の平均注文金額（USD）を知りたいとします：
    - `New Worksheet`タブをクリックして新しいTableを作成します
    - nationTableからNameを`Rows`にドラッグします
    - ordersTableからOrderDateを`Columns`にドラッグします

以下のように表示されるはずです：

6. 注意：`Abc`値は、このアイコンに集約ロジックを定義していないため、単に埋め込まれた値です。したがって、メジャーをTableにドラッグする必要があります。ordersTableからTotalpriceをTableの中央にドラッグします。デフォルトの計算はTotalpricesのSUMであることに注意してください：
   ![](/images/ecomsystem/tableau/Am9IbyUo4o30DixVi2ccoZvKn8b.png)
7. `SUM`をクリックして`Measure`を`Average`に変更します。
   ![](/images/ecomsystem/tableau/AaFwbMOKTo86NaxU54mcVYs1nJd.png)
8. 同じドロップダウンメニューから`Format`を選択し、`Numbers`を`Currency (Standard)`に変更します
   ![](/images/ecomsystem/tableau/ZmRDbjws9o5Ampx4YZYcS6Umnqf.png)
9. 期待に応えるTableを取得できます。
   ![](/images/ecomsystem/tableau/MNb0bjoB2ozn4kxfKx9cVj2hnhb.png)

この時点で、TableauがApache Dorisに正常に接続され、データ分析とダッシュボード作成が可能になりました。

## 接続と使用のヒント

**パフォーマンス最適化**

- 実際のニーズに基づいてDorisデータベースTableを適切に作成し、時間による分散とバケット化により述語フィルタリングとデータ転送の大部分を効果的に削減します。
- Doris側でマテリアライズドビューを作成することで適切なデータ事前集約を実現できます。
- リフレッシュ計算リソース消費とダッシュボードデータの適時性のバランスを取るために、合理的なリフレッシュスケジュールを設定します。

**セキュリティ設定**

- パブリックネットワークアクセスによって導入されるセキュリティリスクを回避するため、VPCプライベート接続の使用を推奨します。
- アクセスを制限するためにセキュリティグループを設定します。
- SSL/TLS接続やその他のアクセス方法を有効にします。
- 過度な権限委譲を避けるため、Dorisユーザーアカウントのロールとアクセス権限を細かく調整します。
