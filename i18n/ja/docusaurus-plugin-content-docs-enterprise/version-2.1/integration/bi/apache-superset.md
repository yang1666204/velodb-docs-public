---
{
  "title": "Apache Superset",
  "description": "Apache Supersetは、豊富なデータソース接続と様々な可視化手法をサポートするオープンソースのデータマイニングプラットフォームです。",
  "language": "ja"
}
---
Apache Supersetは、豊富なデータソース接続、多様な可視化手法、きめ細かなユーザーアクセス制御をサポートするオープンソースのデータマイニングプラットフォームです。主な機能には、セルフサービス分析、カスタマイズ可能なダッシュボード、分析結果の可視化（エクスポート）、ユーザー/ロールアクセス制御、SQL編集とクエリのための統合SQLエディターが含まれます。

Apache Supersetバージョン3.1では公式の接続方法を提供し、Apache Dorisの内部および外部データの両方のクエリと可視化を公式にサポートしています。Apache Dorisバージョン2.0.4以上を推奨します。

この接続方法により、SupersetはApache DorisのデータベースとTableをデータソースとして統合できます。この機能を有効にするには、以下のセットアップガイドに従ってください：

- 前提条件のセットアップ
- Apache SupersetでのApache Dorisデータソースの設定
- Apache Supersetでの可視化の構築
- 接続と使用のヒント

## Supersetとdoris Pythonクライアントのインストール

1. Python 3をインストールします。バージョン3.1.11を推奨します。
2. Apache Supersetバージョン3.1以降をインストールします。詳細は[Installing Superset from PyPI repository](https://superset.apache.org/docs/installation/installing-superset-from-pypi)を参照してください。
3. Apache SupersetサーバーにApache Doris Pythonクライアントをインストールします。以下のコマンドを参照できます：

```
pip install pydoris
```
インストール結果の確認：

```
-> pip list | grep pydoris
pydoris                       1.1.0
```
環境が正しいことを確認した後、SupersetでDorisデータソースを設定し、データの可視化の構築を開始できます！

## SupersetでのDorisデータソースの設定

**Pydoris**と**Apache Superset**のドライバをインストールしたので、Dorisのtpchデータベースに接続するSupersetのデータソースを定義する方法を見てみましょう。

1. PydorisでApache Dorisに接続するには、SQLAlchemy URI接続文字列を設定する必要があります：

次の形式で設定を完了します：

`doris://<User>:<Password>@<Host>:<Port>/<Catalog>.<Database>`

URIパラメータは以下で説明されています：

| パラメータ | 意味 | 例 |
|------|------|------|
| **User** | ユーザー名 | testuser |
| **Password** | パスワード | xxxxxx |
| **Host** | データベースホスト | 127.0.1.28 |
| **Port** | データベースクエリポート | 9030 |
| **カタログ** | Doris Catalog、外部Tableとデータレイクをクエリする際に使用；内部Tableはinternal | internal |
| **Database** | データベース名 | tpch |

2. Supersetにアクセスします。

![](/images/ecomsystem/superset/OXIbbtkncoLHDUxjfdCcAmaenJm.png)

3. ログイン後、右上のSettings -> Database Connectorsをクリックします。

![](/images/ecomsystem/superset/ELzsb6xMaoqcAYxnVuzcP3hhnbg.png)

4. Add Databaseをクリックします。Connect a databaseポップアップウィンドウでApache Dorisを選択します。

![](/images/ecomsystem/superset/TQpibvPYEoyKltx34G5c8B5AnGg.png)

5. 接続情報にSQLAlchemy URIを入力します。接続が正しいことを確認した後、Connectをクリックします。

![](/images/ecomsystem/superset/FndlbO7Fgo4ppixTFWIc0UQUnFb.png)

6. データソースの追加が完了しました。

![](/images/ecomsystem/superset/GsClbUlmsooSdMx994tcjqm1nre.png)

次に、Supersetでいくつかの可視化を構築できます！

## Supersetでの可視化の構築

データソースとしてTPC-Hデータを選択します。Doris TPC-Hデータソースの構築手順については、このドキュメントを参照してください。

SupersetでDorisデータソースを設定したので、データを可視化してみましょう...

コスト分析のために、異なる貨物方法の注文金額の時間変動曲線を分析する必要があるとします。

1. DatasetsをクリックしてDatasetを追加します

![](/images/ecomsystem/superset/C55Kbstx1ogXOtxadBccEavLnOf.png)

2. 以下を順番に選択し、右下のCreate dataset and create chartをクリックします：
    - Database：Doris
    - Schema： tpch
    - Table：lineitem

![](/images/ecomsystem/superset/AAlebfk9ro0SkCxLKXFcq2Scnov.png)

3. lineitem Datasetを編集します

![](/images/ecomsystem/superset/BHIObcQrboRQWSx4yatcoo4enxc.png)

4. Metrics -> Add itemをクリックして計算メトリックを追加します。
    - Metric Key : Revenue
    - SQL expression :  `SUM(`l_extendedprice` * (1 - `l_discount`))`

![](/images/ecomsystem/superset/DUOvbeQPdojk9YxAsbGcfKT2nOe.png)

5. Chart -> Add Chartに移動し、dataesetでlineitemを選択し、チャートタイプでLine Chartを選択します。

![](/images/ecomsystem/superset/KKndbObRCoVBDQxOgMNcJLYanUz.png)

6. l_shipdateをX軸にドラッグし、時間の粒度を設定します。同時に、Revenumカスタムメトリックとデータ列l_shipmodeをそれぞれMetersとDimensionsにドラッグします。

![](/images/ecomsystem/superset/Aewqbeul9oFZekx3vOUcZ3ranAf.png)

7. アップデート chartをクリックしてダッシュボードの内容を表示します。Saveをクリックしてダッシュボードを保存します。

![](/images/ecomsystem/superset/WwYLbzgatoYuLzx9jjmc1STOnwb.png)

この時点で、SupersetがApache Dorisに正常に接続され、データ分析と可視化ダッシュボードの作成が実装されました。

## 接続と使用のヒント

- Superset環境でpydorisを事前にインストールして、データベース作成時にApache Dorisを選択できるようにします。
- 実際のニーズに応じてDorisデータベースTableを合理的に作成し、時間によってパーティショニングとバケッティングを行うことで、述語フィルタリングとほとんどのデータ転送を効果的に削減できます。
- パブリックネットワークアクセスによって生じるセキュリティリスクを回避するため、VPCプライベート接続の使用を推奨します。
- 過度な権限委任を避けるため、Dorisユーザーアカウントの役割とアクセス許可を精密化します。
