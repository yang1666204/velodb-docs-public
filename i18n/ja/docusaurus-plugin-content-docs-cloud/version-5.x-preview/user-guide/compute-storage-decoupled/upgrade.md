---
{
  "title": "クラスターのアップグレード",
  "description": "このガイドでは、ストレージ・コンピューティング分離アーキテクチャ（Cloud Modeとも呼ばれる）を使用してDorisをアップグレードするための手順を段階的に説明します。",
  "language": "ja"
}
---
# Upgrade

## 概要

このガイドでは、ストレージ・コンピュート分離アーキテクチャ（Cloud Modeとも呼ばれる）を使用してDorisをアップグレードするための段階的な手順を提供します。アップグレードは、クラスターアップグレードのためにこのセクションで推奨される手順を使用して実行する必要があります。Dorisクラスターのアップグレードは**ローリングアップグレード**方式を使用して実行できます。この方式では、アップグレードのためにすべてのクラスターノードをシャットダウンする必要がなく、アプリケーションへの影響を大幅に最小限に抑えます。

## Dorisバージョンの説明

Dorisは、ドットで区切られた3つの数字によるバージョン形式を使用しており、以下のSQLを使用して確認できます：

```sql
MySQL [(none)]> select @@version_comment;
+--------------------------------------------------------+
| @@version_comment                                      |
+--------------------------------------------------------+
| Doris version doris-3.0.3-rc03-43f06a5e26 (Cloud Mode) |
+--------------------------------------------------------+
```
`3.0.3`の1番目の数字はメジャーバージョン番号、2番目の数字はマイナーバージョン番号、3番目の数字はパッチバージョン番号を表します。場合によっては、`2.0.2.1`のように4桁の形式になることがあり、最後の数字は緊急バグ修正バージョンを示します。これは通常、このパッチバージョンに重大なバグがあることを意味します。

Dorisはバージョン`3.0.0`以降、cloud modeデプロイメントをサポートしています。このモードでデプロイされた場合、バージョン番号にCloud Mode接尾辞が付きます。integrated storage and compute（別名Local）モードで起動された場合、そのような接尾辞は付きません。

DorisをCloud modeでデプロイした場合、Localモードに戻すことはサポートされていません。同様に、LocalモードのDorisはCloud modeへの切り替えをサポートしていません。

原則として、Dorisは低いバージョンから高いバージョンへのアップグレードと、パッチバージョン間でのダウングレードをサポートしています。マイナーバージョンまたはメジャーバージョン間でのダウングレードは許可されていません。

## Upgrade Steps

### Upgrade Instructions

1. DorisがCloud modeで起動していることを確認してください。Dorisの現在のデプロイメントモードが不明な場合は、[前のセクション](#doris-version-description)の手順を参照してください。
   LocalモードのDorisについては、アップグレード手順として[Cluster Upgrade](upgrade)を参照してください。
2. アップグレードプロセス中のノード再起動によるタスク失敗を回避するため、Dorisのデータインポートタスクに再試行メカニズムがあることを確認してください。
3. アップグレード前に、すべてのDorisコンポーネント（MetaService、Recycler、Frontend、Backend）のステータスをチェックし、正常に動作しており例外ログがないことを確認して、アップグレードプロセスへの影響を回避することを推奨します。

### 概要 of the Upgrade Process

1. メタデータバックアップ
2. MetaServiceのアップグレード
3. Recyclerのアップグレード（ある場合）
4. BEのアップグレード
5. FEのアップグレード
   1. 最初にObserver FEをアップグレード
   2. 次に他の非Master FEをアップグレード
   3. 最後にMaster FEをアップグレード

### Upgrade Pre-work

1. Master FEのメタデータディレクトリをバックアップしてください。通常、メタデータディレクトリはFEホームディレクトリ下の`doris-meta`ディレクトリです。このディレクトリが空の場合、メタデータを保存する別のディレクトリを設定していることを意味します。FE設定ファイル（conf/fe.conf）で`meta_dir`を検索できます。
2. Doris公式サイトからパッケージを[Download](https://doris.apache.org/download)してください。パッケージがDorisから提供されたものと一致することを確認するため、SHA-512ハッシュの検証を推奨します。

### Upgrade Process

#### 1. Upgrade MetaService

以下の環境変数を想定：
- `${MS_HOME}`: MetaServiceの作業ディレクトリ。
- `${MS_PACKAGE_DIR}`: 新しいMetaServiceパッケージを含むディレクトリ。

各MetaServiceインスタンスをアップグレードするには、次の手順に従ってください。

1.1. 現在のMetaServiceを停止：

```shell
cd ${MS_HOME}
sh bin/stop.sh
```
1.2. 既存のMetaServiceバイナリをバックアップする:

```shell
mv ${MS_HOME}/bin bin_backup_$(date +%Y%m%d_%H%M%S)
mv ${MS_HOME}/lib lib_backup_$(date +%Y%m%d_%H%M%S)
```
1.3. 新しいpackageをデプロイする：

```shell
cp ${MS_PACKAGE_DIR}/bin ${MS_HOME}/bin
cp ${MS_PACKAGE_DIR}/lib ${MS_HOME}/lib
```
1.4. 新しいMetaServiceを開始する：

```shell
sh ${MS_HOME}/bin/start.sh --daemon
```
1.5. 新しいMetaServiceのステータスを確認してください:

新しいMetaServiceが実行されており、`${MS_HOME}/log/doris_cloud.out`に新しいバージョン番号が存在することを確認してください。

#### 2. Recyclerのアップグレード（存在する場合）

:::caution
Recyclerコンポーネントを個別にデプロイしていない場合は、この手順をスキップできます。
:::

以下の環境変数を想定しています:
- `${RECYCLER_HOME}`: RecyclerのワーキングディレクトリLTOなメータサービス
- `${MS_PACKAGE_DIR}`: 新しいMetaServiceパッケージを含むディレクトリ。MetaServiceとRecyclerは同じパッケージを使用します。

以下の手順に従って各Recyclerインスタンスをアップグレードしてください。

2.1. 現在のRecyclerを停止してください:

```shell
cd ${RECYCLER_HOME}
sh bin/stop.sh
```
2.2. 既存のRecyclerバイナリファイルをバックアップする：

```shell
mv ${RECYCLER_HOME}/bin bin_backup_$(date +%Y%m%d_%H%M%S)
mv ${RECYCLER_HOME}/lib lib_backup_$(date +%Y%m%d_%H%M%S)
```
2.3. 新しいpackageをデプロイする：

```shell
cp ${RECYCLER_PACKAGE_DIR}/bin ${RECYCLER_HOME}/bin
cp ${RECYCLER_PACKAGE_DIR}/lib ${RECYCLER_HOME}/lib
```
2.4. 新しいRecyclerを開始する:

```shell
sh ${RECYCLER_HOME}/bin/start.sh --recycler --daemon
```
2.5. 新しいRecyclerのステータスを確認：

新しいMetaServiceが実行されており、`${RECYCLER_HOME}/log/doris_cloud.out`に新しいバージョン番号が存在することを確認してください。

#### 3. BEのアップグレード

MetaServiceとRecycler（個別にインストールされている場合）のすべてのインスタンスがアップグレードされていることを確認してください。

以下の環境変数を仮定：
- `${BE_HOME}`: BEの作業ディレクトリ。
- `${BE_PACKAGE_DIR}`: 新しいBEパッケージを含むディレクトリ。

以下の手順に従って各BEインスタンスをアップグレードしてください。

3.1. 現在のBEを停止：

```shell
cd ${BE_HOME}
sh bin/stop_be.sh
```
3.2. 既存のBEバイナリをバックアップする:

```shell
mv ${BE_HOME}/bin bin_backup_$(date +%Y%m%d_%H%M%S)
mv ${BE_HOME}/lib lib_backup_$(date +%Y%m%d_%H%M%S)
```
3.3. 新しいパッケージをデプロイする：

```shell
cp ${BE_PACKAGE_DIR}/bin ${BE_HOME}/bin
cp ${BE_PACKAGE_DIR}/lib ${BE_HOME}/lib
```
3.4. 新しいBEを開始する：

```shell
sh ${BE_HOME}/bin/start_be.sh --daemon
```
3.5. 新しいBEのステータスを確認する：

新しいBEが新バージョンで動作し、稼働していることを確認してください。ステータスとバージョンは以下のSQLを使用して取得できます。

```sql
show backends;
```
#### 4. FEのアップグレード

BEのすべてのインスタンスがアップグレードされていることを確認してください。

以下の環境変数を想定します：
- `${FE_HOME}`：FEの作業ディレクトリ。
- `${FE_PACKAGE_DIR}`：新しいFEパッケージが含まれるディレクトリ。

以下の順序でFrontend（FE）インスタンスをアップグレードします：
1. Observer FEノード
2. Non-master FEノード
3. Master FEノード

以下の手順に従って各Frontend（FE）ノードをアップグレードします。

4.1. 現在のFEを停止します：

```shell
cd ${FE_HOME}
sh bin/stop_fe.sh
```
4.2. 既存のFEバイナリをバックアップする：

```shell
mv ${FE_HOME}/bin bin_backup_$(date +%Y%m%d_%H%M%S)
mv ${FE_HOME}/lib lib_backup_$(date +%Y%m%d_%H%M%S)
```
4.3. 新しいパッケージをデプロイする：

```shell
cp ${FE_PACKAGE_DIR}/bin ${FE_HOME}/bin
cp ${FE_PACKAGE_DIR}/lib ${FE_HOME}/lib
```
4.4. 新しいFEを開始する：

```shell
sh ${FE_HOME}/bin/start_fe.sh --daemon
```
4.5. 新しいFEのステータスを確認する：

新しいFEが新しいバージョンで稼働し、動作していることを確認してください。ステータスとバージョンは以下のSQLを使用して取得できます。

```sql
show frontends;
```
## FAQ

1. ローカルモードのDorisではアップグレード前にレプリカバランス機能を無効にする必要がありますか？また、クラウドモードのクラスターでは必要ですか？

いいえ。クラウドモードでは、データはHDFSやS3サービスに保存されているため、レプリカバランシングは必要ありません。

2. 独立したMetaServiceがメタデータサービスを提供しているのに、なぜFEのメタデータをバックアップする必要があるのですか？

現在、MetaServiceは一部のメタデータを保存し、FEも一部のメタデータを保存しているためです。安全性の理由により、FEのメタデータをバックアップすることを推奨しています。
