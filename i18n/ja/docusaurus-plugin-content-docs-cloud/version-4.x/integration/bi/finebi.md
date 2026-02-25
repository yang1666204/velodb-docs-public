---
{
  "title": "FineBI",
  "description": "ビジネスインテリジェンス製品として、FineBIはデータ処理、リアルタイム分析、多次元分析Dashboard、および...のシステムアーキテクチャを持っています。",
  "language": "ja"
}
---
# FineBI

## FineBI 概要

ビジネスインテリジェンス製品として、FineBI は、データ処理、リアルタイム分析、多次元分析 Dashboard およびその他の機能のシステムアーキテクチャを備えています。FineBI は豊富なデータソース接続と複数のビューを持つテーブルの分析および管理をサポートします。FineBI は Apache Doris の内部および外部データのモデリングと可視化を正常にサポートできます。

## 前提条件

FineBI 5.0 以降をインストールしてください。ダウンロードリンク：https://intl.finebi.com/

## ログインと接続

1. アカウントを作成し、FineBI にログインします

   ![login page](/images/cloud/integration/bi/bi-finebi-en-1.png)

2. 組み込みデータベースを選択します。外部データベース設定を選択する必要がある場合は、以下のドキュメントをご覧ください：https://help.fanruan.com/finebi-en/doc-view-4437.html

   :::info Note
   FineBI の情報リポジトリとして組み込みデータベースを選択することを推奨します。ここで選択されるデータベースタイプは、データのクエリと分析のためのターゲットデータベースではなく、FineBI モデル、dashboard およびその他の情報を保存・維持するためのデータベースです。FineBI はこれに対して追加、削除、変更、確認を行う必要があります。
   :::

   ![select database](/images/cloud/integration/bi/bi-finebi-en-2.png)

3. Management System ボタンをクリックし、Data Connections でデータベース接続管理を選択して、新しいデータベース接続を作成します。

   ![data connection](/images/cloud/integration/bi/bi-finebi-en-3.png)

4. 新しいデータベース接続ページで、MySQL データベースを選択します

   ![select connection](/images/cloud/integration/bi/bi-finebi-en-4.png)

5. Doris データベースのリンク情報を入力します

    - パラメータは以下のとおりです：

        - Username：Doris へのログイン用ユーザー名

        - Password：現在のユーザーのパスワード

        - Host：Doris クラスターの FE ホストの IP アドレス

        - Port：Doris クラスターの FE クエリポート

        - Coding：Doris クラスターのエンコーディング形式

        - Name Database：Doris クラスターのターゲットデータベース

   ![connection information](/images/cloud/integration/bi/bi-finebi-en-5-1.png)

6. テストリンクをクリックします。接続情報が正しい場合、Connection succeeded が表示されます

   ![connection test](/images/cloud/integration/bi/bi-finebi-en-6.png)

## モデルの作成

1. 「Public Data」セクションで、新しいデータセットを作成するためにクリックします。次に、データベーステーブルをクリックします

   ![new dataset](/images/cloud/integration/bi/bi-finebi-en-7.png)

2. 既存のデータベース接続でテーブルをインポートする必要があります

   ![select table](/images/cloud/integration/bi/bi-finebi-en-8-2.png)

3. テーブルをインポートした後、インポートされた各テーブルを更新する必要があります。テーブルを更新した後でのみ、トピック内でテーブルを分析できます

   ![refresh table](/images/cloud/integration/bi/bi-finebi-en-9.png)

4. インポートされた公開データを編集済みのトピックに追加し、ビジネスロジックに従ってコンパス分析と設定を実行します。

   ![data analysis](/images/cloud/integration/bi/bi-finebi-en-10.png)
