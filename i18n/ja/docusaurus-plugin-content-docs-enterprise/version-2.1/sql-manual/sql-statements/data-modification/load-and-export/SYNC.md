---
{
  "title": "SYNC",
  "description": "この文は、non-master Frontend（FE）ノードのメタデータを同期するために使用されます。Apache Dorisでは、master FEノードのみがメタデータを書き込むことができます。",
  "language": "ja"
}
---
## 概要

このステートメントは、非master Frontend (FE) ノードのメタデータを同期するために使用されます。Apache Dorisでは、master FEノードのみがメタデータを書き込むことができ、他のFEノードはメタデータ書き込み操作をmasterに転送します。masterがメタデータ書き込み操作を完了した後、非masterノードでメタデータの再生に短い遅延が発生する場合があります。このステートメントを使用してメタデータの強制同期を行うことができます。

## 構文

```sql
SYNC;
```
## Access Control Requirements  

任意のユーザーまたはロールがこの操作を実行できます。

## Examples

メタデータを同期する：

    ```sql
    SYNC;
    ```
