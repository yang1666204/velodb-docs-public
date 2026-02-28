---
{
  "title": "FineBI",
  "description": "ビジネスインテリジェンス製品として、FineBIはデータ処理、リアルタイム分析の",
  "language": "ja"
}
---
## FineBI 概要

ビジネスインテリジェンス製品として、FineBIはデータ処理、リアルタイム分析、多次元分析Dashboardなどの機能を持つシステムアーキテクチャを備えています。FineBIは豊富なデータソース接続と複数のビューを持つTableの分析と管理をサポートしています。FineBIはApache Dorisの内部および外部データのモデリングと可視化を正常にサポートできます。

## 前提条件

FineBI 5.0以降をインストールしてください。ダウンロードリンク：https://intl.finebi.com/

## ログインと接続

1. アカウントを作成してFineBIにログインする

   ![login page](/images/bi-finebi-en-1.png)

2. Built-in databaseを選択してください。外部データベース設定を選択する必要がある場合は、以下のドキュメントをご参照ください：https://help.fanruan.com/finebi-en/doc-view-4437.html

   :::info Note
   FineBIの情報リポジトリとしてbuilt-in databaseを選択することを推奨します。ここで選択するデータベースタイプは、データのクエリと分析を行う対象データベースではなく、FineBIのモデル、dashboardおよびその他の情報を保存・維持するためのデータベースです。FineBIはこれに対して追加、削除、変更、チェックを行う必要があります。
   :::

   ![select database](/images/bi-finebi-en-2.png)

3. Management Systemボタンをクリックし、Data ConnectionsでDatabase connection managementを選択して新しいデータベース接続を作成します。

   ![data connection](/images/bi-finebi-en-3.png)

4. 新しいデータベース接続ページでMySQLデータベースを選択します

   ![select connection](/images/bi-finebi-en-4.png)

5. Dorisデータベースのリンク情報を入力してください

    - パラメータの説明は以下の通りです：

        - Username: Dorisにログインするためのユーザー名

        - Password: 現在のユーザーのパスワード

        - Host: DorisクラスタのFEホストのIPアドレス

        - Port: DorisクラスタのFEクエリポート

        - Coding: Dorisクラスタのエンコーディング形式

        - Name Database: Dorisクラスタ内の対象データベース

   ![connection information](/images/bi-finebi-en-5-1.png)

6. test linkをクリックします。接続情報が正しい場合、Connection succeededが表示されます

   ![connection test](/images/bi-finebi-en-6.png)

## モデルの作成

1. 「Public Data」セクションで、新しいデータセットの作成をクリックします。次にdatabase tableをクリックします

   ![new dataset](/images/bi-finebi-en-7.png)

2. 既存のデータベース接続内のTableをインポートする必要があります

   ![select table](/images/bi-finebi-en-8-2.png)

3. Tableをインポートした後、インポートした各Tableを更新する必要があります。Tableを更新した後でのみ、トピック内でTableを分析できます

   ![refresh table](/images/bi-finebi-en-9.png)

4. インポートした公開データを編集したトピックに追加し、ビジネスロジックに従ってcompass分析と設定を実施します。

   ![data analysis](/images/bi-finebi-en-10.png)
