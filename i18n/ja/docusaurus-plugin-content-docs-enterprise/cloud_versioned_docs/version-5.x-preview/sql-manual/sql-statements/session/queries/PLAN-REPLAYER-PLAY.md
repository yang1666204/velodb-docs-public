---
{
  "title": "PLAN REPLAYER PLAY",
  "description": "PLAN REPLAYER PLAYは、Doris開発者がオプティマイザの問題を分析するために使用されるツールです。PLAN REPLAYER DUMPによって生成された診断ファイルに基づいて、",
  "language": "ja"
}
---
## Description

PLAN REPLAYER PLAYは、Dorisの開発者がオプティマイザの問題を分析するために使用されるツールです。PLAN REPLAYER DUMPによって生成された診断ファイルに基づき、対応するバージョンのfeにメタデータと統計情報をロードして、開発者が問題を再現およびデバッグできるようにします。

## Syntax

```sql
PLAN REPLAYER PLAY <absolute-directory-of-dumpfile>；
```
## 必須パラメータ

`<absolute-directory-of-dumpfile>`

- ダンプファイルの絶対パスを指定する文字列です。
- 識別子はダブルクォートで囲む必要があり、対応するファイルへの絶対パスです。

## 例


`dumpfile: /home/wangwu/dumpfile.json`がある場合、以下のSQLを使用してシナリオを再現できます：

```sql
PLAN REPLAYER PLAY "/home/wangwu/dumpfile.json"；
```
