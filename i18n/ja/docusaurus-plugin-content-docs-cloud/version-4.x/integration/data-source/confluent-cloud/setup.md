---
{
  "title": "Confluent Cloudのセットアップ",
  "description": "VeloDB統合のためのConfluent Cloudクラスターとサンプルデータのセットアップ",
  "language": "ja"
}
---
# Confluent Cloud セットアップ

このガイドでは、VeloDBに接続するためのサンプルデータを含むConfluent Cloud Kafkaクラスターのセットアップについて説明します。

## 前提条件

- Confluent Cloudアカウント（[無料サインアップ](https://confluent.cloud)）

---

## ステップ1: Kafkaクラスターの作成

1. [Confluent Cloud](https://confluent.cloud)にログインします

![Confluent Cloud Home](/images/cloud/integration/confluent-cloud/confluent1.png)

2. **Add cluster**をクリックするか、**Environments** > **default** > **Add cluster**に移動します

3. クラスタータイプを選択します：
   - **Basic** - 無料ティア、開発およびテストに適しています
   - **Standard** - より高い制限を持つ本番ワークロード

4. **Provider and region**を選択します：
   - 最高のパフォーマンスを得るため、VeloDBウェアハウスと同じクラウドプロバイダーとリージョンを選択してください
   - 例：AWS us-east-1

![Create Cluster](/images/cloud/integration/confluent-cloud/confluent2.png)

5. **Launch cluster**をクリックします

---

## ステップ2: Datagenでサンプルデータを作成

Confluentの組み込みDatagenコネクタを使用してサンプルデータを生成します：

1. クラスター内で、左サイドバーの**Connectors**に移動します

2. **Add connector**をクリックします

3. **サンプル Data**または**Datagen Source**を検索します

4. **サンプル Data**をクリックしてクイックランチダイアログを開きます

![Launch サンプル Data](/images/cloud/integration/confluent-cloud/confluent3.png)

5. コネクターを設定します：
   - **Topic**: `sample_data_orders`（または任意の名前）
   - **Select a template**: **Orders**を選択します（このガイドでは推奨）

6. **Launch**をクリックします

7. コネクターのステータスが**Running**と表示されるまで待ちます

![Connector Running](/images/cloud/integration/confluent-cloud/confluent4.png)

:::caution 重要 - データ形式
デフォルトのDatagenコネクターは**AVRO**形式を生成します。VeloDBは**JSON**と**CSV**形式のみをサポートします。

JSON形式を使用するには、起動前に**Additional configuration**をクリックして以下を設定してください：
- **Output record value format**: `JSON`

既にAVROでコネクターを作成した場合は、JSON出力用に設定された新しいDatagenコネクターで新しいトピックを作成してください。
:::

---

## ステップ3: APIキーの作成

1. クラスター下の左サイドバーにある**API Keys**に移動します

![API Keys Page](/images/cloud/integration/confluent-cloud/confluent5.png)

2. **Create key**をクリックします

3. **Global access**を選択します（または特定のリソースにスコープを設定）

4. **Next**をクリックし、続いて**Create**をクリックします

5. **両方の値を保存してください** - VeloDBで必要になります：
   - **API Key**（ユーザー名）
   - **API Secret**（パスワード）

:::warning
API Secretは一度だけ表示されます。ダイアログを閉じる前に安全に保存してください。
:::

---

## ステップ4: Bootstrap Serverの取得

1. 左サイドバーの**Cluster Settings**に移動します

![Cluster Settings](/images/cloud/integration/confluent-cloud/confluent6.png)

2. **Endpoints**セクションを見つけます

3. **Bootstrap server** URL（例：`pkc-xxxxx.us-east-1.aws.confluent.cloud:9092`）をコピーします

---

## VeloDBに必要な値

セットアップ完了後、以下の値が必要になります：

| 値 | 説明 | 例 |
|-------|-------------|---------|
| **Bootstrap サーバー** | Kafkaブローカーエンドポイント | `pkc-xxxxx.us-east-1.aws.confluent.cloud:9092` |
| **API Key** | 認証ユーザー名 | `ABCD1234EFGH5678` |
| **API Secret** | 認証パスワード | `cflt37r+oeQB...` |
| **Topic Name** | 消費するトピック | `sample_data_orders` |

---

## セットアップの確認

コネクターがデータを生成していることを確認します：

1. 左サイドバーの**Topics**に移動します
2. トピック（例：`sample_data_orders`）をクリックします
3. **Messages**タブに移動します
4. メッセージが生成されていることを確認できるはずです

---

## 次のステップ

Confluent Cloudのセットアップが完了したら、[Connect to Confluent Cloud](../confluent-cloud)に進んでVeloDBでストリーミングインポートをセットアップしてください。
