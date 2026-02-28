---
{
  "title": "QuickSight",
  "description": "QuickSightは、データ計算と視覚的に魅力的なチャートをシームレスに統合する堅牢なデータ可視化・分析プラットフォームです。",
  "language": "ja"
}
---
# QuickSight

QuickSightは、公式MySQL data sourceを通じてDirectly queryまたはImportモードでApache Dorisに接続できます

## Prerequisites

- Apache Dorisのバージョンは3.1.2以上である必要があります
- AWSサーバーがDorisクラスターにアクセスできるように、Dorisデプロイメント環境に応じてネットワーク接続（VPC、security group設定）を構成する必要があります。
- 宣言されたMySQL互換性バージョンを調整するために、DorisにMySQL clientで接続して以下のSQLを実行してください：

  ```sql
  SET GLOBAL version = '8.3.99';
  ```
検証結果:

  ```sql
  mysql> show variables like "version";
  +---------------+--------+---------------+---------+
  | Variable_name | Value  | Default_Value | Changed |
  +---------------+--------+---------------+---------+
  | version       | 8.3.99 | 5.7.99        | 1       |
  +---------------+--------+---------------+---------+
  1 row in set (0.01 sec)
  ```
## QuickSight を Apache Doris に接続する

まず、[https://quicksight.aws.amazon.com](https://quicksight.aws.amazon.com/) にアクセスし、Datasets に移動して「New dataset」をクリックします：

![New dataset1](/images/cloud/integration/bi/quicksight/Cm8EbaeoIoYDeAxGDR8cuSFhns1.png)

![New dataset2](/images/cloud/integration/bi/quicksight/XngnbqKxhouZHIxgVYhcyta5n3f.png)

QuickSight にバンドルされている公式の MySQL connector を検索します：

![connector](/images/cloud/integration/bi/quicksight/Pjf5bRheroLmtKxcZ2PcFYMkn7d.png)

接続の詳細を指定します。MySQL インターフェースポートはデフォルトで 9030 ですが、FE の `query_port` 設定によって異なる場合があることに注意してください。

![configuration](/images/cloud/integration/bi/quicksight/DlJobTycDoqhDOxdUtCcqZCxnkc.png)

これで、リストからTableを選択できます：

![table](/images/cloud/integration/bi/quicksight/LAFXbSSnwop5C7xn3kPcEcBZnmc.png)

「Directly query」モードを選択することをお勧めします：

![Directly query](/images/cloud/integration/bi/quicksight/RN4fbtJU5o89gQxePQKcOGRBnyh.png)

さらに、「Edit/Preview data」をクリックすることで、内部Table構造を表示したり、カスタム SQL を調整したりできます。ここでデータセットを調整できます：

![dataset](/images/cloud/integration/bi/quicksight/DoVOMbQTxBrRBpx3Bbgn2gcUXLd.png)

これで、データセットを公開して新しい可視化を作成できます！

![visualizations](/images/cloud/integration/bi/quicksight/MXgObQbdDoLBVTxBrRBcUpx3n2g.png)

## QuickSight での可視化の構築

データソースとして TPC-H データを選択しました。Doris TPC-H データソースの構築手順については、[このドキュメント](../../benchmark/tpch) を参照してください。

QuickSight で Doris データソースを設定したので、データを可視化してみましょう...

Doris の複数Table結合シナリオでの優れたパフォーマンスのため、このシナリオに基づいたダッシュボードの設計を選択しました。異なる国の異なるステータスでの注文統計を知る必要があるとします。この要件に従ってダッシュボードを構築します。

1. 上記の手順で作成したデータソースに、以下のTableを Dataset として追加します。

- customer
- nation
- orders

2. 「Create Dataset」をクリックします

![Create Dataset](/images/cloud/integration/bi/quicksight/LDeebS3RdoB6hPxcYkacV88VnMd.png)

3. 上記の手順で作成したデータソースを選択します

![Select datasource](/images/cloud/integration/bi/quicksight/LQlLb26gZoXOurxO3AJc0xCBnqd.png)

4. 必要なTableを選択します

![select tables](/images/cloud/integration/bi/quicksight/W7bDb42r4ovxr3xGDU0cRxmbnsf.png)

Directly Query mode を選択します

![Directly Query mode](/images/cloud/integration/bi/quicksight/Nllyb7GkJo8ToCxXSuDc4gNgnvg.png)

「Visualize」をクリックしてデータソースを作成します。これらの手順に従って、他のTableのデータソースも作成してください。

5. ダッシュボード作成ワークベンチに入り、現在の Dataset ドロップダウンメニューをクリックして、Add New Dataset を選択します。

![workbench](/images/cloud/integration/bi/quicksight/D18HbY2PWoQvMOxlJTRcOfZenEh.png)

6. すべてのデータセットを順番に選択し、Select をクリックして、ダッシュボードに追加します。

![sequence](/images/cloud/integration/bi/quicksight/TzM6boK9No1wD0xBBeAcaJGcnDd.png)

7. 完了後、nation の操作インターフェースをクリックしてデータセット編集インターフェースに入ります。データセットで列結合を実行します。

![joins1](/images/cloud/integration/bi/quicksight/Y0GpbCY0oo6xeYxfufAcPAC6n1e.png)

8. 図に示すように、Add data をクリックしてデータソースを追加します。

![joins2](/images/cloud/integration/bi/quicksight/ZNKgbdPivoM3y7xwr8kcZbWPn8c.png)

9. 3つのTableを追加した後、結合を実行します。結合関係は以下の通りです：
    - **customer**：c_nationkey  --  **nation**：n_nationkey
    - **customer**：c_custkey  --  **orders**：o_custkey

![joins3](/images/cloud/integration/bi/quicksight/HVNIbL0yDouA8axQmIocXFhFnmc.png)

10. 結合が完了したら、右上の Save & Publish をクリックして公開します。

![publish](/images/cloud/integration/bi/quicksight/CD9pbqFIOouYFtxUrs9cMlyAnph.png)

11. 3つのデータソースを追加した Analyses インターフェースに戻り、n_name をクリックして国名別の注文総数を表示します。

![build1](/images/cloud/integration/bi/quicksight/D6Yrb7Igwo5520x3WBbcZ8T9n9f.png)

12. VALUE をクリックして o_orderkey を選択し、GROUP/COLOR をクリックして o_orderstatus を選択すると、要求されたダッシュボードが得られます。

![build2](/images/cloud/integration/bi/quicksight/Sl8nbfrszok2bexesfwcsNqbngc.png)

13. 右上の Publish をクリックしてダッシュボードの公開を完了します。

これで、QuickSight が Apache Doris に正常に接続され、データ分析と可視化ダッシュボードの作成が実装されました。
