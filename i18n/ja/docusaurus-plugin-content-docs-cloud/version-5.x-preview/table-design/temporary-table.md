---
{
  "title": "一時Table",
  "description": "複雑なデータ処理タスクを実行する際、大きなSQLクエリを複数のステップに分割し、各ステップの結果を一時的に保存することで",
  "language": "ja"
}
---
複雑なデータ処理タスクを実行する際、大きなSQLクエリを複数のステップに分割し、各ステップの結果を物理Tableとして一時的に保存することは効果的な戦略です。この方法により、SQLクエリの複雑さを大幅に軽減し、データのデバッグ可能性を向上させることができます。ただし、これらの物理Tableは目的を果たした後に手動でクリーンアップする必要があることに注意が重要です。非物理的な一時Tableが好ましい場合、Dorisは現在`WITH`句での定義のみをサポートしています。

上記の問題に対処するため、Dorisは一時Table機能を導入します。一時Tableは一時的に存在する実体化された内部Tableであり、以下の主要な特性を持ちます：
1. **セッションバインディング**: 一時Tableは作成されたセッション内でのみ存在します。そのライフサイクルは現在のセッションに密接に結び付いており、セッションが終了すると、そのセッション内で作成された一時Tableは自動的に削除されます。

2. **セッション固有の可視性**: 一時Tableの可視性は、作成されたセッションに厳密に制限されます。同じユーザーが同時に開始した別のセッションでも、これらの一時Tableにアクセスすることはできません。

一時Table機能の導入により、Dorisは複雑なデータ処理における一時データの保存と管理を簡素化するだけでなく、データ処理の柔軟性とセキュリティをさらに向上させます。

:::note

内部Tableと同様に、一時Tableは内部カタログ内のDatabase下に作成する必要があります。ただし、一時Tableはセッションベースであるため、その命名は一意性制約の対象ではありません。異なるセッションで同じ名前の一時Tableを作成したり、他の内部Tableと同じ名前の一時Tableを作成したりできます。

同じDatabase内で同じ名前の一時Tableと非一時Tableが同時に存在する場合、一時Tableが最高のアクセス優先度を持ちます。そのセッション内では、同じ名前のTableに対するすべてのクエリと操作は一時Tableにのみ影響します（マテリアライズドビューの作成を除く）。
:::

## 使用方法

### 一時Tableの作成

Unique、Aggregate、またはDuplicateモデルなど、さまざまなモデルのTableを一時Tableとして定義できます。以下のSQL文でTEMPORARYキーワードを追加することで一時Tableを作成できます：
-  [CREATE TABLE](../sql-manual/sql-statements/table-and-view/table/CREATE-TABLE.md)
-  [CREATE TABLE AS SELECT](../sql-manual/sql-statements/table-and-view/table/CREATE-TABLE.md)
-  [CREATE TABLE LIKE](../sql-manual/sql-statements/table-and-view/table/CREATE-TABLE.md)

一時Tableのその他の使用方法は、基本的に通常の内部Tableと同じです。上記のCreate文を除き、他のDDLおよびDML文ではTEMPORARYキーワードを追加する必要はありません。

## 注意事項

- 一時Tableは内部カタログでのみ作成できます。
- Table作成時にENGINEをOLAPに設定する必要があります。
- 一時Tableの変更にはAlter文はサポートされていません。
- 一時的な性質により、一時Tableに基づくビューやマテリアライズドビューの作成はサポートされていません。
- 一時Tableはバックアップできず、CCR/Sync Jobを使用した同期もサポートされていません。
- Export、Stream Load、Broker Load、S3 Load、MySQL Load、Routine Load、およびSpark Loadはサポートされていません。
- 一時Tableが削除される際、リサイクルビンには移動されず、即座に完全に削除されます。
