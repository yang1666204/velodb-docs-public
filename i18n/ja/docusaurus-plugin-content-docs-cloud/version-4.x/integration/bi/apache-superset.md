---
{
  "title": "Apache Superset",
  "description": "Apache Supersetはオープンソースのデータ探索プラットフォームです。豊富な種類のデータソース接続と数多くの可視化手法をサポートしています。",
  "language": "ja"
}
---
# Apache Superset

Apache Supersetは、豊富なデータソース接続、様々な可視化手法、きめ細かなユーザーアクセス制御をサポートするオープンソースのデータマイニングプラットフォームです。主な機能には、セルフサービス分析、カスタマイズ可能なダッシュボード、分析結果の可視化（エクスポート）、ユーザー/ロールアクセス制御、SQL編集とクエリのための統合SQLエディタが含まれます。

Apache Supersetバージョン3.1は公式接続方法を提供し、Apache Dorisの内部および外部データの両方のクエリと可視化を公式にサポートしています。Apache Dorisバージョン2.0.4以上を推奨します。

この接続方法により、SupersetはApache DorisデータベースとTableをデータソースとして統合できます。この機能を有効にするには、以下のセットアップガイドに従ってください：

- 前提条件のセットアップ
- Apache SupersetでのApache Dorisデータソースの設定
- Apache Supersetでの可視化の構築
- 接続と使用のヒント

## Supersetとの Doris Python clientのインストール

1. Python 3をインストールします。バージョン3.1.11を推奨します。
2. Apache Supersetバージョン3.1以降をインストールします。詳細は[Installing Superset from PyPI repository](https://superset.apache.org/docs/installation/installing-superset-from-pypi)を参照してください。
3. Apache SupersetサーバーにApache Doris Python clientをインストールします。以下のコマンドを参考にできます：

```
pip install pydoris
```
インストール結果の確認：

```
-> pip list | grep pydoris
pydoris                       1.1.0
```
環境が正しいことを確認した後、SupersetでDorisデータソースを設定し、データビジュアライゼーションの構築を開始できます！

## SupersetでのDorisデータソースの設定

**Pydoris**と**Apache Superset**のドライバーをインストールしたので、Dorisのtpchデータベースに接続するSupersetのデータソースの定義方法を見てみましょう。

1. Pydoris経由でApache Dorisに接続するには、SQLAlchemy URI接続文字列を設定する必要があります：

この形式で設定を完了してください：

`doris://<User>:<Password>@<Host>:<Port>/<Catalog>.<Database>`

URIパラメータの説明は以下の通りです：

| Parameter | Meaning | Example |
|------|------|------|
| **User** | ユーザー名 | testuser |
| **Password** | パスワード | xxxxxx |
| **Host** | データベースホスト | 127.0.1.28 |
| **Port** | データベースクエリポート | 9030 |
| **Catalog** | Doris Catalog、外部Tableとデータレイクのクエリ時に使用；内部Tableはinternal | internal |
| **Database** | データベース名 | tpch |

2. Supersetへのアクセス。

![Accessing](/images/cloud/integration/bi/superset/OXIbbtkncoLHDUxjfdCcAmaenJm.png)

3. ログイン後、右上のSettings -> Database Connectorsをクリックします。

![logging](/images/cloud/integration/bi/superset/ELzsb6xMaoqcAYxnVuzcP3hhnbg.png)

4. Add Databaseをクリックします。Connect a databaseポップアップウィンドウで、Apache Dorisを選択します。

![Add Database](/images/cloud/integration/bi/superset/TQpibvPYEoyKltx34G5c8B5AnGg.png)

5. 接続情報にSQLAlchemy URIを入力します。接続が正しいことを確認した後、Connectをクリックします。

![SQLAlchemy](/images/cloud/integration/bi/superset/FndlbO7Fgo4ppixTFWIc0UQUnFb.png)

6. データソースの追加が完了しました。

![complete](/images/cloud/integration/bi/superset/GsClbUlmsooSdMx994tcjqm1nre.png)

次に、Supersetでビジュアライゼーションを構築できます！

## Supersetでのビジュアライゼーション構築

データソースとしてTPC-Hデータを選択します。Doris TPC-Hデータソースの構築手順については、[このドキュメント](../../benchmark/tpch)を参照してください。

SupersetでDorisデータソースを設定したので、データを可視化してみましょう...

コスト分析のために、異なる運送方法の注文金額の時間変動曲線を分析する必要があると仮定します。

1. DatasetsをクリックしてDatasetを追加します

![add dataset](/images/cloud/integration/bi/superset/C55Kbstx1ogXOtxadBccEavLnOf.png)

2. 以下を順次選択し、右下のCreate dataset and create chartをクリックします：
    - Database：Doris
    - Schema： tpch
    - Table：lineitem

![dataset](/images/cloud/integration/bi/superset/AAlebfk9ro0SkCxLKXFcq2Scnov.png)

3. lineitem Datasetを編集します

![edit](/images/cloud/integration/bi/superset/BHIObcQrboRQWSx4yatcoo4enxc.png)

4. Metrics -> Add itemをクリックして、計算メトリックを追加します。
    - Metric Key : Revenue
    - SQL expression :  `SUM(`l_extendedprice` * (1 - `l_discount`))`

![Metrics](/images/cloud/integration/bi/superset/DUOvbeQPdojk9YxAsbGcfKT2nOe.png)

5. Chart -> Add Chartに移動し、dataesetにlineitemを選択し、チャートタイプにLine Chartを選択します。

![Chart](/images/cloud/integration/bi/superset/KKndbObRCoVBDQxOgMNcJLYanUz.png)

6. l_shipdateをX軸にドラッグし、時間粒度を設定します。同時に、Revenumカスタムメトリックとデータ列l_shipmodeをそれぞれMetersとDimensionsにドラッグします。

![build](/images/cloud/integration/bi/superset/Aewqbeul9oFZekx3vOUcZ3ranAf.png)

7. アップデート chartをクリックしてダッシュボードの内容を表示します。Saveをクリックしてダッシュボードを保存します。

![end](/images/cloud/integration/bi/superset/WwYLbzgatoYuLzx9jjmc1STOnwb.png)

この時点で、SupersetがApache Dorisに正常に接続され、データ分析とビジュアライゼーションダッシュボードの作成が実装されました。

## 接続と使用のヒント

- Superset環境でpydorisを事前インストールして、データベース作成時にApache Dorisを選択できるようにします。
- 実際のニーズに応じてDorisデータベースTableを合理的に作成し、時間でパーティション化とバケット化を行うことで、述語フィルタリングと大部分のデータ転送を効果的に削減できます。
- パブリックネットワークアクセスによるセキュリティリスクを回避するため、VPCプライベート接続の使用を推奨します。
- 過度な権限委譲を回避するため、Dorisユーザーアカウントのロールとアクセス権限を細分化してください。
