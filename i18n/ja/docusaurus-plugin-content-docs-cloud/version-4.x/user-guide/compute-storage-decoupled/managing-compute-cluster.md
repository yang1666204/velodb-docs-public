---
{
  "title": "Compute Groups の管理",
  "description": "compute-storage分離アーキテクチャでは、1つまたは複数のcomputeノード（BE）をCompute Groupにグループ化することができます。",
  "language": "ja"
}
---
# Compute Groupの管理

コンピュートストレージ分離アーキテクチャでは、1つ以上のコンピュートノード（BE）をCompute Groupにグループ化できます。本ドキュメントでは、次の操作を含むcompute groupの使用方法について説明します：

- 全compute groupの表示
- compute groupアクセス権の付与
- ユーザーレベルでのcompute groupのバインド（`default_compute_group`）によるユーザーレベル分離

*注意*
バージョン3.0.2以前では、これはCompute Clusterと呼ばれていました。

## Compute Group使用シナリオ

マルチcompute groupアーキテクチャでは、1つ以上のステートレスBEノードをcompute clusterにグループ化できます。compute cluster指定文（use @<compute_group_name>）を使用することで、特定のワークロードを特定のcompute clusterに割り当て、複数のインポートおよびクエリワークロードの物理的分離を実現できます。

2つのcompute cluster：C1とC2があると仮定します。

- **読み取り-読み取り分離**：2つの大きなクエリを開始する前に、それぞれ`use @c1`と`use @c2`を使用して、クエリが異なるコンピュートノード上で実行されることを保証します。これにより、同じデータセットにアクセスする際のリソース競合（CPU、メモリなど）を防ぎます。

- **読み取り-書き込み分離**：Dorisデータインポートは大量のリソースを消費し、特に大容量データと高頻度インポートのシナリオでは顕著です。クエリとインポート間のリソース競合を回避するため、`use @c1`と`use @c2`を使用してクエリをC1で実行し、インポートをC2で実行するよう指定できます。さらに、C1 compute clusterはC2 compute clusterで新しくインポートされたデータにアクセスできます。

- **書き込み-書き込み分離**：読み取り-書き込み分離と同様に、インポート同士も分離できます。例えば、システムに高頻度小規模インポートと大規模バッチインポートの両方がある場合、バッチインポートは通常時間がかかり再試行コストが高い一方、高頻度小規模インポートは迅速で再試行コストが低くなります。小規模インポートがバッチインポートに干渉することを防ぐため、`use @c1`と`use @c2`を使用して小規模インポートをC1で実行し、バッチインポートをC2で実行するよう指定できます。

## デフォルトCompute Group選択メカニズム

ユーザーが明示的に[デフォルトcompute groupを設定](#setting-default-compute-group)していない場合、システムは自動的にユーザーが使用権限を持つActive BEを含むcompute groupを選択します。特定のセッションでデフォルトcompute groupが決定されると、ユーザーが明示的にデフォルト設定を変更しない限り、そのセッション中は変更されません。

異なるセッションで以下の状況が発生した場合、システムはユーザーのデフォルトcompute groupを自動的に変更する可能性があります：

- ユーザーが前回のセッションで選択されたデフォルトcompute groupの使用権限を失った
- compute groupが追加または削除された
- 以前に選択されたデフォルトcompute groupにAlive BEが存在しなくなった

状況1と2は確実に自動選択されるデフォルトcompute groupの変更につながり、状況3は変更につながる可能性があります。

## 全Compute Groupの表示

`SHOW COMPUTE GROUPS`コマンドを使用して、現在のリポジトリ内の全compute groupを表示します。返される結果は、ユーザーの権限レベルに基づいて異なる内容が表示されます：

- `ADMIN`権限を持つユーザーは全compute groupを表示可能
- 一般ユーザーは使用権限（USAGE_PRIV）を持つcompute groupのみ表示可能
- ユーザーがいずれのcompute groupに対しても使用権限を持たない場合、空の結果が返される

```sql
SHOW COMPUTE GROUPS;
```
## Compute Groupの追加

Compute Groupの管理には`OPERATOR`権限が必要で、この権限はノード管理の許可を制御します。詳細については、[権限管理](../../sql-manual/sql-statements/account-management/GRANT-TO)を参照してください。デフォルトでは、rootアカウントのみが`OPERATOR`権限を持ちますが、`GRANT`コマンドを使用して他のアカウントに付与することができます。
BEを追加してCompute Groupに割り当てるには、[Add BE](../../sql-manual/sql-statements/cluster-management/instance-management/ADD-BACKEND)コマンドを使用します。例：

```sql
ALTER SYSTEM ADD BACKEND 'host:9050' PROPERTIES ("tag.compute_group_name" = "new_group");
```
上記のsqlは`host:9050`をcompute group `new_group`に追加します。PROPERTIES文を省略した場合、BEはcompute group `default_compute_group`に追加されます。例：

```sql
ALTER SYSTEM ADD BACKEND 'host:9050';
```
## Compute Groupアクセスの付与

前提条件：現在の操作ユーザーがADMIN権限を持つか、現在のユーザーがadminロールに属している。

```sql
GRANT USAGE_PRIV ON COMPUTE GROUP {compute_group_name} TO {user}
```
## Compute Group Accessの取り消し

前提条件: 現在の操作ユーザーが'ADMIN'権限を持っている、または現在のユーザーがadminロールに属している。

```sql
REVOKE USAGE_PRIV ON COMPUTE GROUP {compute_group_name} FROM {user}
```
## Setting Default Compute Group 

現在のユーザーのデフォルトcompute groupを設定するには（この操作には、現在のユーザーが既にcomputing groupを使用する権限を持っている必要があります）：

```sql
SET PROPERTY 'default_compute_group' = '{clusterName}';
```
他のユーザーのデフォルトcompute groupを設定するには（この操作にはAdmin権限が必要です）：

```sql
SET PROPERTY FOR {user} 'default_compute_group' = '{clusterName}';
```
現在のユーザーのデフォルトコンピュートグループを確認するには、返された結果の`default_compute_group`の値がデフォルトコンピュートグループになります：

```sql
SHOW PROPERTY;
```
他のユーザーのデフォルトコンピュートグループを表示するには、この操作では現在のユーザーが管理者権限を持つ必要があり、返される結果の`default_compute_group`の値がデフォルトコンピュートグループです：

```sql
SHOW PROPERTY FOR {user};
```
現在のリポジトリで利用可能なすべてのcompute groupを表示するには：

```sql
SHOW COMPUTE GROUPS;
```
:::info Note

- 現在のユーザーがAdmin roleを持つ場合、例：`CREATE USER jack IDENTIFIED BY '123456' DEFAULT ROLE "admin"`の場合：
  - 自分自身と他のユーザーのデフォルトcompute groupを設定できます；
  - 自分自身と他のユーザーの`PROPERTY`を表示できます。
- 現在のユーザーがAdmin roleを持たない場合、例：`CREATE USER jack1 IDENTIFIED BY '123456'`の場合：
  - 自分自身のデフォルトcompute groupを設定できます；
  - 自分自身の`PROPERTY`を表示できます；
  - すべてのcompute groupを表示することはできません。この操作には`GRANT ADMIN`権限が必要です。
- 現在のユーザーがデフォルトcompute groupを設定していない場合、データの読み書き操作を実行するときに既存のシステムでエラーが発生します。この問題を解決するために、ユーザーは`use @cluster`コマンドを実行して現在のコンテキストで使用するcompute groupを指定するか、`SET PROPERTY`文を使用してデフォルトcompute groupを設定することができます。
- 現在のユーザーがデフォルトcompute groupを設定したが、そのclusterがその後削除された場合、データの読み書き操作中にもエラーが発生します。ユーザーは`use @cluster`コマンドを実行して現在のコンテキストで使用するcompute groupを再指定するか、`SET PROPERTY`文を使用してデフォルトcluster設定を更新することができます。

:::


## Compute Groupの切り替え

ユーザーはcompute-storage decoupledアーキテクチャで使用するデータベースとcompute groupを指定できます。

**構文**

```sql
USE { [catalog_name.]database_name[@compute_group_name] | @compute_group_name }
```
データベースまたはcompute group名に予約語が含まれている場合、対応する名前はバッククォート```で囲む必要があります。

## Compute Groupのスケーリング

`ALTER SYSTEM ADD BACKEND`と`ALTER SYSTEM DECOMMISION BACKEND`を使用してBEを追加または削除することで、compute groupをスケールできます。
