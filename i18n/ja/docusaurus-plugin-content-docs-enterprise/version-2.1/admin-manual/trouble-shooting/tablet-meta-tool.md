---
{
  "title": "タブレットメタデータ管理ツール",
  "description": "最新版のコードでは、タブレットのメタ情報を保存するためにBEにRocksDBを導入しました。",
  "language": "ja"
}
---
# Tablet metadata management tool

## 背景

コードの最新バージョンでは、header fileを通じたメタ情報の保存によって引き起こされる様々な機能的およびパフォーマンスの問題を解決するために、BEにRocksDBを導入してtabletのメタ情報を保存しました。現在、各データディレクトリ（root path）には対応するRocksDBインスタンスがあり、対応するroot path上のすべてのtabletがkey-value方式で保存されています。

これらのmetadataのメンテナンスを容易にするため、関連する管理操作を完了するためのオンラインHTTPインターフェースとオフラインmeta toolを提供しています。

HTTPインターフェースはtablet metadataをオンラインで閲覧するためにのみ使用され、BEプロセスが実行中に使用できます。

一方、meta toolはオフラインmetadata管理操作にのみ使用されます。使用前にBEを停止する必要があります。

meta tool toolはBEのLib/ディレクトリに保存されています。

## 操作

### Tablet Metaの表示

Tablet Meta情報の表示は、オンライン方式とオフライン方式に分けられます

#### オンライン

BEのHTTPインターフェースにアクセスして、対応するTablet Meta情報を取得します：

api:

`http://{host}:{port}/api/meta/header/{tablet_id}/{schema_hash}`

> Host: be Hostname
>
> port: BEのHTTPポート
>
> tablet id: tablet id
>
> schema hash: tablet schema hash

例：

`http://be_host:8040/api/meta/header/14156/2458238340`

最終的なクエリが成功した場合、Tablet Metaがjsonとして返されます。

#### オフライン

meta\ tool toolに基づいてディスク上のTablet Metaを取得します。

Command:

```
./lib/meta_tool --root_path=/path/to/root_path --operation=get_meta --tablet_id=xxx --schema_hash=xxx
```
> root_path: be.confで設定された対応するroot_pathパスパス。

結果もJSON形式でのTablet Metaの表現です。

### Load header

Load headerの機能は、tabletの手動移行を実現するために提供されています。この機能はJSON形式のTablet Metaに基づいているため、shardフィールドやバージョン情報の変更が必要な場合、Tablet MetaのJSONコンテンツ内で直接変更することができます。その後、以下のコマンドを使用してロードします。

Command:

```
./lib/meta_tool --operation=load_meta --root_path=/path/to/root_path --json_meta_path=path
```
### Delete header

BEのディスクからタブレットメタを削除する機能を実現するために。単一削除とバッチ削除をサポートします。

単一削除：

```
./lib/meta_tool --operation=delete_meta --root_path=/path/to/root_path --tablet_id=xxx --schema_hash=xxx`
```
バッチ削除：

```
./lib/meta_tool --operation=batch_delete_meta --tablet_file=/path/to/tablet_file.txt
```
`tablet_file.txt`の各行は、タブレットの情報を表します。形式は次の通りです：

`root_path,tablet_id,schema_hash`

各列はカンマで区切られます。

`tablet_file`の例：

```
/output/be/data/,14217,352781111
/output/be/data/,14219,352781111
/output/be/data/,14223,352781111
/output/be/data/,14227,352781111
/output/be/data/,14233,352781111
/output/be/data/,14239,352781111
```
バッチ削除は、`tablet_file`内の不正なタブレット情報フォーマットの行をスキップします。実行完了後、削除成功数とエラー数が表示されます。

### Pb形式のTabletMeta

このコマンドは、古いファイルベース管理のPB形式のTablet Metaを表示し、Tablet MetaをJSON形式で表示するためのものです。

コマンド:

```
./lib/meta_tool --operation=show_meta --root_path=/path/to/root_path --pb_header_path=path
```
### Pb形式のセグメントメタ

このコマンドはPb形式のセグメントメタを表示し、セグメントメタをJSON形式で表示するためのものです。

Command:

```
./meta_tool --operation=show_segment_footer --file=/path/to/segment/file
```
