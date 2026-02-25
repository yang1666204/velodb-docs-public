---
{
  "title": "リソースグループ",
  "description": "Resource Groupは、コンピュート・ストレージ統合アーキテクチャの下で、異なるワークロード間の物理的分離を実現するメカニズムです。",
  "language": "ja"
}
---
# Resource Group

Resource Group は、コンピュート・ストレージ統合アーキテクチャの下で、異なるワークロード間の物理的分離を実現するメカニズムです。その基本原理は以下の図で示されています：

![Resource Group](/images/cloud/user-guide/admin-manual/workload-management/resource-isolation/resource-group.png)

- タグを使用することで、BEは異なるグループに分割され、各グループはタグの名前で識別されます。例えば、上図では、host1、host2、host3はすべてgroup aに設定され、host4とhost5はgroup bに設定されています。

- テーブルの異なるレプリカは異なるグループに配置されます。例えば、上図では、table1は3つのレプリカを持ち、すべてgroup aに配置されており、table2は4つのレプリカを持ち、2つがgroup a、2つがgroup bに配置されています。

- クエリ実行時、ユーザーに基づいて異なるResource Groupが使用されます。例えば、オンラインユーザーはhost1、host2、host3のデータにのみアクセスできるため、table1とtable2の両方にアクセスできます。しかし、オフラインユーザーはhost4とhost5にのみアクセスできるため、table2のデータにのみアクセスできます。table1はgroup bに対応するレプリカを持たないため、アクセスするとエラーが発生します。

本質的に、Resource Groupはテーブルレプリカの配置戦略であるため、以下の利点と制限があります：

- 異なるResource Groupは異なるBEを使用するため、完全に分離されています。グループ内のBEが故障しても、他のグループのクエリには影響しません。データロードには複数のレプリカが成功する必要があるため、残りのレプリカ数がクォーラムを満たさない場合、データロードは依然として失敗します。

- 各Resource Groupは各テーブルの少なくとも1つのレプリカを持つ必要があります。例えば、5つのResource Groupを確立し、各グループがすべてのテーブルにアクセスできるようにしたい場合、各テーブルには5つのレプリカが必要となり、大幅なストレージコストが発生する可能性があります。

## 典型的な使用例

- 読み書き分離：クラスターを2つのResource Groupに分割し、ETLジョブを実行するOffline Resource Groupとオンラインクエリを処理するOnline Resource Groupを設けることができます。データは3つのレプリカで保存され、Online Resource Groupに2つのレプリカ、Offline Resource Groupに1つのレプリカを配置します。Online Resource Groupは主に高並行性、低レイテンシのオンラインデータサービスに使用され、大規模なクエリやオフラインETL操作はOffline Resource Groupのノードを使用して実行できます。これにより、統一されたクラスター内でオンラインとオフラインの両方のサービスを提供できます。

- 異なる事業間の分離：複数の事業間でデータが共有されていない場合、各事業にResource Groupを割り当てることで、事業間の干渉を防ぐことができます。これにより、複数の物理クラスターを効果的に1つの大きなクラスターに統合して管理できます。

- 異なるユーザー間の分離：例えば、クラスター内に3人のユーザー全員で共有する必要がある業務テーブルがあるが、ユーザー間のリソース競合を最小限に抑えたい場合、テーブルの3つのレプリカを作成し、3つの異なるResource Groupに保存して、各ユーザーを特定のResource Groupにバインドすることができます。

## Resource Groupの設定

### BEにタグを設定する

現在のDorisクラスターにhost[1-6]という名前の6つのBEノードがあると仮定します。初期状態では、すべてのBEノードはデフォルトリソースグループ（Default）に属しています。

以下のコマンドを使用して、これら6つのノードを3つのリソースグループ：group_a、group_b、group_cに分割できます。

   ```sql
   alter system modify backend "host1:9050" set ("tag.location" = "group_a");
   alter system modify backend "host2:9050" set ("tag.location" = "group_a");
   alter system modify backend "host3:9050" set ("tag.location" = "group_b");
   alter system modify backend "host4:9050" set ("tag.location" = "group_b");
   alter system modify backend "host5:9050" set ("tag.location" = "group_c");
   alter system modify backend "host6:9050" set ("tag.location" = "group_c");
   ```
ここでは、host[1-2]でResource Group group_a、host[3-4]でResource Group group_b、host[5-6]でResource Group group_cを構成します。

> 注意: BEは一つのResource Groupにのみ所属できます。

### Resource Groupによるデータの再分散

リソースグループを分割した後、異なるリソースグループ間でユーザーデータの異なるレプリカを分散できます。UserTableという名前のユーザーテーブルがあり、3つのリソースグループそれぞれに1つずつレプリカを保存したいとします。これは以下のテーブル作成文によって実現できます：

   ```sql
   create table UserTable
   (k1 int, k2 int)
   distributed by hash(k1) buckets 1
   properties(
       "replication_allocation"="tag.location.group_a:1, tag.location.group_b:1, tag.location.group_c:1"
   )
   ```
このようにして、UserTableのデータは3つのレプリカに保存され、それぞれがリソースグループgroup_a、group_b、group_cに属するノード上に配置されます。

以下の図は、現在のノードの分割とデータ分散を示しています：

   ```text
    ┌────────────────────────────────────────────────────┐
    │                                                    │
    │         ┌──────────────────┐  ┌──────────────────┐ │
    │         │ host1            │  │ host2            │ │
    │         │  ┌─────────────┐ │  │                  │ │
    │ group_a │  │   replica1  │ │  │                  │ │
    │         │  └─────────────┘ │  │                  │ │
    │         │                  │  │                  │ │
    │         └──────────────────┘  └──────────────────┘ │
    │                                                    │
    ├────────────────────────────────────────────────────┤
    ├────────────────────────────────────────────────────┤
    │                                                    │
    │         ┌──────────────────┐  ┌──────────────────┐ │
    │         │ host3            │  │ host4            │ │
    │         │                  │  │  ┌─────────────┐ │ │
    │ group_b │                  │  │  │   replica2  │ │ │
    │         │                  │  │  └─────────────┘ │ │
    │         │                  │  │                  │ │
    │         └──────────────────┘  └──────────────────┘ │
    │                                                    │
    ├────────────────────────────────────────────────────┤
    ├────────────────────────────────────────────────────┤
    │                                                    │
    │         ┌──────────────────┐  ┌──────────────────┐ │
    │         │ host5            │  │ host6            │ │
    │         │                  │  │  ┌─────────────┐ │ │
    │ group_c │                  │  │  │   replica3  │ │ │
    │         │                  │  │  └─────────────┘ │ │
    │         │                  │  │                  │ │
    │         └──────────────────┘  └──────────────────┘ │
    │                                                    │
    └────────────────────────────────────────────────────┘
   ```
データベースに非常に多数のテーブルが含まれている場合、各テーブルの分散戦略を変更するのは煩雑になる可能性があります。そのため、Dorisではデータベースレベルで統一されたデータ分散戦略を設定することもサポートしていますが、個々のテーブルの設定はデータベースレベルの設定よりも優先度が高くなります。例えば、4つのテーブルを持つデータベースdb1を考えてみましょう。table1はgroup_a:1,group_b:2のレプリカ分散戦略を必要とし、table2、table3、table4はgroup_c:1,group_b:2の戦略を必要とします。

​    デフォルトの分散戦略でdb1を作成するには、以下のステートメントを使用できます：

   ```sql
   CREATE DATABASE db1 PROPERTIES (
   "replication_allocation" = "tag.location.group_c:1, tag.location.group_b:2"
   )
   ```
特定の分散戦略でtable1を作成します：

   ```sql
   CREATE TABLE table1
   (k1 int, k2 int)
   distributed by hash(k1) buckets 1
   properties(
   "replication_allocation"="tag.location.group_a:1, tag.location.group_b:2"
   )
   ```
table2、table3、table4については、作成文でreplication_allocationを指定する必要はありません。これらのテーブルはデータベースレベルのデフォルト戦略を継承するためです。

   :::caution
   データベースレベルでレプリカ分散戦略を変更しても、既存のテーブルには影響しません。
   :::


## ユーザーに対するリソースグループの設定

以下の文を使用して、ユーザーの特定のリソースグループへのアクセスを制限できます。例えば、user1はgroup_aリソースグループ内のノードのみを使用でき、user2はgroup_bのみを使用でき、user3は3つのリソースグループすべてを使用できます：

   ```sql
   set property for 'user1' 'resource_tags.location' = 'group_a';
   set property for 'user2' 'resource_tags.location' = 'group_b';
   set property for 'user3' 'resource_tags.location' = 'group_a, group_b, group_c';
   ```
設定後、user1がUserTableをクエリすると、group_aリソースグループ内のノードのデータレプリカのみにアクセスし、このグループのコンピューティングリソースを使用します。User3のクエリは、任意のリソースグループのレプリカとコンピューティングリソースを使用できます。

   > 注記：デフォルトでは、ユーザーのresource_tags.locationプロパティは空です。バージョン2.0.2以前では、ユーザーはタグによる制限を受けず、任意のリソースグループを使用できます。バージョン2.0.3以降では、一般ユーザーはデフォルトでデフォルトリソースグループのみを使用できます。Rootユーザーとadminユーザーは任意のリソースグループを使用できます。

   :::caution 注意:
    resource_tags.locationプロパティを変更した後、変更を有効にするためにユーザーは接続を再確立する必要があります。
   :::

   

## データロードジョブのリソースグループ割り当て

データロードジョブ（insert、broker load、routine load、stream loadなどを含む）のリソース使用は、2つの部分に分けられます：

- コンピューティング部分：データソースの読み取り、データ変換、分散を担当します。

- 書き込み部分：データエンコーディング、圧縮、ディスクへの書き込みを担当します。

書き込みリソースはデータレプリカが配置されているノード上にある必要があり、コンピューティングリソースは任意のノードから割り当て可能であるため、Resource Groupsはデータロードシナリオにおいてコンピューティング部分で使用されるリソースのみを制限できます。
