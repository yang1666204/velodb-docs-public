---
{
  "title": "MaxCompute Catalog",
  "description": "MaxComputeは、Alibaba Cloud上のエンタープライズレベルのSaaS（Software as a Service）クラウドデータウェアハウスです。",
  "language": "ja"
}
---
[MaxCompute](https://help.aliyun.com/zh/maxcompute/)は、Alibaba Cloud上のエンタープライズレベルのSaaS（Software as a Service）クラウドデータウェアハウスです。MaxComputeが提供するオープンストレージSDKを通じて、DorisはMaxComputeテーブル情報にアクセスし、クエリを実行できます。

## 適用シナリオ

| シナリオ | 説明                 |
| ---- | ------------------------------------------------------ |
| データ統合 | MaxComputeデータを読み取り、Doris内部テーブルに書き込む。 |
| データ書き戻し | サポートされていません。                           |

## 注意事項

1. バージョン2.1.7以降、MaxCompute Catalogは[open storage SDK](https://help.aliyun.com/zh/maxcompute/user-guide/overview-1)に基づいて開発されています。それ以前は、Tunnel APIに基づいて開発されていました。

2. open storage SDKの使用には一定の制限があります。この[ドキュメント](https://help.aliyun.com/zh/maxcompute/user-guide/overview-1)の`Usage Restrictions`セクションを参照してください。

3. Dorisバージョン3.1.3より前では、MaxComputeの`Project`はDorisの`Database`に相当します。3.1.3以降では、`mc.enable.namespace.schema`パラメータを使用してMaxComputeスキーマレベルを導入できます。

## Catalogの設定

### 構文

```sql
CREATE CATALOG [IF NOT EXISTS] catalog_name PROPERTIES (
    'type' = 'max_compute',
    {McRequiredProperties},
    {McOptionalProperties},
    {CommonProperties}
);
```
* `{McRequiredProperties}`

  | Property Name        | Description                                                                                                         | Supported Doris Version |
  | ------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------- |
  | `mc.default.project` | アクセスしたいMaxComputeプロジェクト名。[MaxCompute Project List](https://maxcompute.console.aliyun.com/cn-beijing/project-list)で作成・管理できます。 |                         |
  | `mc.access_key`     | AccessKey。[Alibaba Cloud Console](https://ram.console.aliyun.com/manage/ak)で作成・管理できます。                                          |                         |
  | `mc.secret_key`     | SecretKey。[Alibaba Cloud Console](https://ram.console.aliyun.com/manage/ak)で作成・管理できます。                                          |                         |
  | `mc.region`          | MaxComputeが有効になっているリージョン。Endpointから対応するリージョンを見つけることができます。                                                        | Before 2.1.7            |
  | `mc.endpoint`       | MaxComputeが有効になっているリージョン。Endpointと Quotaの取得方法については以下のセクションを参照してください。                         | 2.1.7 and later         |

* `{McOptionalProperties}`

  | Property Name              | Default Value   | Description                                                                 | Supported Doris Version |
  | -------------------------- | --------------- | --------------------------------------------------------------------------- | ----------------------- |
  | `mc.tunnel_endpoint`        | None            | 付録の`カスタムサービスアドレス`を参照してください。                          | Before 2.1.7            |
  | `mc.odps_endpoint`          | None            | 付録の`カスタムサービスアドレス`を参照してください。                          | Before 2.1.7            |
  | `mc.quota`                  | `pay-as-you-go` | Quota名。Endpointと Quotaの設定取得方法についてはセクションを参照してください。 | 2.1.7 and later         |
  | `mc.split_strategy`         | `byte_size`     | 分割戦略を設定します。`byte_size`（バイトサイズで分割）または`row_count`（行数で分割）に設定できます。 | 2.1.7 and later         |
  | `mc.split_byte_size`        | `268435456`     | 各分割で読み取るファイルサイズ（バイト）。デフォルトは256 MB。`"mc.split_strategy" = "byte_size"`の場合のみ有効。 | 2.1.7 and later         |
  | `mc.split_row_count`        | `1048576`       | 各分割で読み取る行数。`"mc.split_strategy" = "row_count"`の場合のみ有効。 | 2.1.7 and later         |
  | `mc.split_cross_partition`  | `false`         | 生成された分割がパーティションを跨ぐかどうか。                             | 2.1.8 and later         |
  | `mc.connect_timeout`        | `10s`           | MaxComputeへの接続タイムアウト。                                       | 2.1.8 and later         |
  | `mc.read_timeout`           | `120s`          | MaxComputeからの読み取りタイムアウト。                                        | 2.1.8 and later         |
  | `mc.retry_count`            | `4`             | タイムアウト後の再試行回数。                                          | 2.1.8 and later         |
  | `mc.datetime_predicate_push_down` | `true`  | `timestamp/timestamp_ntz`型の述語条件のプッシュダウンを許可するかどうか。Dorisはこれら2つの型を同期する際に精度を失います（9 -> 6）。そのため、元データの精度が6桁より高い場合、条件プッシュダウンが不正確な結果を招く可能性があります。 | 2.1.9/3.0.5 and later  |
  | `mc.account_format` | `name`             | Alibaba Cloud InternationalとChinaのアカウントシステムは異なります。Internationalサイトのユーザーの場合、`user 'RAM$xxxxxx:xxxxx' is not a valid aliyun account`などのエラーが発生したら、このパラメータを`id`に指定できます。 | 3.0.9/3.1.1 later  |
  | `mc.enable.namespace.schema` | `false`             | MaxComputeのschemaレベルがサポートされているかどうか。詳細は：https://help.aliyun.com/zh/maxcompute/user-guide/schema-related-operations | 3.1.3 and later  |
  
* `[CommonProperties]`

CommonPropertiesセクションは共通プロパティの記入に使用されます。Catalog Overviewセクションの[Common Properties](../catalog-overview.md)を参照してください。

### サポートされているMaxComputeバージョン

MaxComputeのパブリッククラウド版のみサポートされています。プライベートクラウド版のサポートについては、Dorisコミュニティにお問い合わせください。

### サポートされているMaxComputeフォーマット

* パーティションテーブル、クラスターテーブル、マテリアライズドビューの読み取りをサポートします。

* MaxCompute外部テーブル、論理ビュー、Delta Tablesの読み取りはサポートしていません。

## 階層マッピング

- `mc.enable.namespace.schema` is false

  | Doris    | MaxCompute |
  | -------- | ---------- |
  | Catalog  | N/A        |
  | Database | Project    |
  | Table    | Table      |

- `mc.enable.namespace.schema` is true

  | Doris    | MaxCompute |
  | -------- | ---------- |
  | Catalog  | Project    |
  | Database | Schema     |
  | Table    | Table      |

## 列型マッピング

| MaxCompute Type  | Doris Type    | Comment                                                                      |
| ---------------- | ------------- | ---------------------------------------------------------------------------- |
| bolean           | boolean       |                                                                              |
| tiny             | tinyint       |                                                                              |
| tinyint          | tinyint       |                                                                              |
| smallint         | smallint      |                                                                              |
| int              | int           |                                                                              |
| bigint           | bigint        |                                                                              |
| float            | float         |                                                                              |
| double           | double        |                                                                              |
| decimal(P, S)    | decimal(P, S) |                                                                              |
| char(N)          | char(N)       |                                                                              |
| varchar(N)       | varchar(N)    |                                                                              |
| string           | string        |                                                                              |
| date             | date          |                                                                              |
| datetime         | datetime(3)   | 精度3への固定マッピング。`SET [GLOBAL] time_zone = 'Asia/Shanghai'`を使用してタイムゾーンを指定できます。 |
| timestamp_ntz    | datetime(6)   | MaxComputeの`timestamp_ntz`の精度は9ですが、DorisのDATETIMEは最大精度6をサポートします。そのため、データ読み取り時に余分な部分は直接切り捨てられます。 |
| timestamp        | datetime(6)   | Since 2.1.9 & 3.0.5. MaxComputeの`timestamp`の精度は9ですが、DorisのDATETIMEは最大精度6をサポートします。そのため、データ読み取り時に余分な部分は直接切り捨てられます。 |
| array            | array         |                                                                              |
| map              | map           |                                                                              |
| struct           | struct        |                                                                              |
| other            | UNSUPPORTED   |                                                                              |

## 例

```sql
CREATE CATALOG mc_catalog PROPERTIES (
    'type' = 'max_compute',
    'mc.default.project' = 'project',
    'mc.access_key' = 'sk',
    'mc.secret_key' = 'ak',
    'mc.endpoint' = 'http://service.cn-beijing-vpc.MaxCompute.aliyun-inc.com/api'
);
```
バージョン2.1.7より前（2.1.7を含まない）を使用している場合は、以下のステートメントを使用してください。（使用にあたっては2.1.8以降へのアップグレードを推奨します）

```sql
CREATE CATALOG mc_catalog PROPERTIES (
    'type' = 'max_compute',
    'mc.region' = 'cn-beijing',
    'mc.default.project' = 'project',
    'mc.access_key' = 'ak',
    'mc.secret_key' = 'sk'
    'mc.odps_endpoint' = 'http://service.cn-beijing.maxcompute.aliyun-inc.com/api',
    'mc.tunnel_endpoint' = 'http://dt.cn-beijing.maxcompute.aliyun-inc.com'
);
```
サポートスキーマ：

```sql
CREATE CATALOG mc_catalog PROPERTIES (
    'type' = 'max_compute',
    'mc.region' = 'cn-beijing',
    'mc.default.project' = 'project',
    'mc.access_key' = 'ak',
    'mc.secret_key' = 'sk'
    'mc.odps_endpoint' = 'http://service.cn-beijing.maxcompute.aliyun-inc.com/api',
    'mc.tunnel_endpoint' = 'http://dt.cn-beijing.maxcompute.aliyun-inc.com',
    'mc.enable.namespace.schema' = 'true'
);
```
## Query Operations

### Basic Query

```sql
-- 1. Switch to catalog, use database, and query
SWITCH mc_ctl;
USE mc_ctl;
SELECT * FROM mc_tbl LIMIT 10;

-- 2. Use mc database directly
USE mc_ctl.mc_db;
SELECT * FROM mc_tbl LIMIT 10;

-- 3. Use fully qualified name to query
SELECT * FROM mc_ctl.mc_db.mc_tbl LIMIT 10;
```
## 付録

### Endpoint と Quota の取得方法（Doris 2.1.7 以降）

1. Data Transmission Service (DTS) 専用リソースグループを使用する場合

	**「専用データサービスリソースグループの使用」**の**「2. 認可」**セクションについて、[ドキュメント](https://help.aliyun.com/zh/maxcompute/user-guide/purchase-and-use-exclusive-resource-groups-for-dts)を参照して、必要な権限を有効化してください。次に、**「Quota Management」**リストに移動して、対応する`QuotaName`を表示・コピーし、`"mc.quota" = "QuotaName"`を使用して指定します。この時点で、VPC または公衆ネットワーク経由でMaxComputeにアクセスできます。ただし、VPCは帯域幅が保証されているのに対し、公衆ネットワークの帯域幅は制限されています。

2. `pay-as-you-go`を使用する場合

   **「オープンストレージの使用（Pay-As-You-Go）」**セクションについて、[ドキュメント](https://help.aliyun.com/zh/maxcompute/user-guide/overview-1)を参照して、オープンストレージ（Storage API）スイッチを有効化し、AkとSKに対応するユーザーに権限を付与してください。この場合、`mc.quota`はデフォルトで`pay-as-you-go`となり、追加の値を指定する必要はありません。pay-as-you-goモデルを使用する場合、MaxComputeにはVPC経由でのみアクセス可能で、公衆ネットワークアクセスは利用できません。前払いユーザーのみが公衆ネットワーク経由でMaxComputeにアクセスできます。

3. [Alibaba Cloud Endpoints Documentation](https://help.aliyun.com/zh/maxcompute/user-guide/endpoints)に基づいて`mc.endpoint`を設定します

   VPC経由でアクセスするユーザーは、**「リージョナルエンドポイントテーブル（Alibaba Cloud VPCネットワーク接続方式）」**の**「VPCネットワークエンドポイント」**列を参照して`mc.endpoint`を設定してください。
   
   公衆ネットワーク経由でアクセスするユーザーは、**「リージョナルエンドポイントテーブル（Alibaba Cloudクラシックネットワーク接続方式）」**の**「クラシックネットワークエンドポイント」**列、または**「リージョナルエンドポイントテーブル（外部ネットワーク接続方式）」**の**「外部ネットワークエンドポイント」**列から選択して`mc.endpoint`を設定できます。

### カスタムサービスアドレス（Doris 2.1.7 以前のバージョン）

Doris 2.1.7以前のバージョンでは、MaxComputeとの相互作用に**Tunnel SDK**が使用されます。そのため、以下の2つのエンドポイントプロパティを設定する必要があります：

- `mc.odps_endpoint`：MaxCompute Endpoint。MaxComputeメタデータ（データベースやテーブル情報など）の取得に使用されます。
- `mc.tunnel_endpoint`：Tunnel Endpoint。MaxComputeデータの読み取りに使用されます。

デフォルトでは、MaxCompute Catalogは`mc.region`と`mc.public_access`の値に基づいてエンドポイントを生成します。

生成されるエンドポイントの形式は以下の通りです：

| `mc.public_access`  | `mc.odps_endpoint`                                       | `mc.tunnel_endpoint`                            |
| ------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| `false`             | `http://service.{mc.region}.maxcompute.aliyun-inc.com/api` | `http://dt.{mc.region}.maxcompute.aliyun-inc.com` |
| `true`              | `http://service.{mc.region}.maxcompute.aliyun.com/api`     | `http://dt.{mc.region}.maxcompute.aliyun.com`     |

ユーザーは`mc.odps_endpoint`と`mc.tunnel_endpoint`を手動で指定してサービスアドレスをカスタマイズすることもできます。これは、MaxCompute環境のプライベートデプロイメントにおいて特に有用です。

MaxCompute EndpointとTunnel Endpointの設定詳細については、[異なるリージョンとネットワーク接続方式のエンドポイント](https://help.aliyun.com/zh/maxcompute/user-guide/endpoints)に関するドキュメントを参照してください。
