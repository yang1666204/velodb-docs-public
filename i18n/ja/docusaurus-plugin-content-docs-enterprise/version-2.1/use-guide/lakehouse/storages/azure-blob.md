---
{
  "title": "Azure Blob",
  "description": "バージョン3.1.3以降、DorisはAzure Blobストレージへのアクセスをサポートしています。",
  "language": "ja"
}
---
バージョン 3.1.3 以降、Doris は Azure Blob ストレージへのアクセスをサポートしています。

本文書では、Microsoft Azure Blob ストレージにアクセスするために必要なパラメータについて説明します。これらのパラメータは以下のシナリオに適用されます：

- カタログ properties
- Table Valued ファンクション properties
- Broker Load properties
- Export properties
- Outfile properties
- Backup / Restore properties

**Azure Blob Storage は現在 ARM アーキテクチャをサポートしていません。**

## パラメータ概要

| Property Name                  | 旧称   | デスクリプション                     | デフォルト値 | Required |
|--------------------------------|---------------|---------------------------------|---------------|----------|
| azure.account_name             |               | Azure ストレージアカウント名（Account Name）。Azure ポータルで作成されたストレージアカウント名です。 |               | Yes      |
| azure.account_key              |               | Azure Blob ストレージの Account Key |               | Yes      |
| azure.endpoint                 |               | Azure Blob ストレージのアクセスエンドポイント。通常は https://<account_name>.blob.core.windows.net の形式です |               | Yes      |
| fs.azure.support               |               | Azure Blob ストレージを有効にするかどうか | true          | Yes      |

- Azure Blob Storage の有効化

  Azure Blob ストレージが有効であることを示すために、`"provider" = "AZURE"` または `"fs.azure.support" = "true"` を明示的に設定する必要があります。

- `azure.account_name` の取得

  1. [Azure Portal](https://portal.azure.com) にログインします
  2. **Storage Accounts** を開き、対象のアカウントを選択します
  3. **概要** ページで **Storage Account Name** を確認できます

  ```properties
  "azure.account_name" = "myblobstorage"
  ```
- `azure.account_key`を取得する

  1. [Azure Portal](https://portal.azure.com)にログインする
  2. **Storage Accounts**を開き、対象のアカウントを選択する
  3. 左のナビゲーションバーで**Access keys**を選択する
  4. **key1**または**key2**の「Show key」をクリックし、**Key value**をコピーする

  ```properties
  "azure.account_key" = "EXAMPLE_I_A...=="
  ```
