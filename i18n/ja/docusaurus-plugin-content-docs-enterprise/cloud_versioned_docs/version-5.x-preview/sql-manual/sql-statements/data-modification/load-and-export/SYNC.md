---
{
  "title": "SYNC",
  "description": "この文は非masterのFrontend (FE) ノードのメタデータを同期するために使用されます。Apache Dorisでは、master FEノードのみがメタデータを書き込むことができます、",
  "language": "ja"
}
---
## 説明

この文は、非masterのFrontend（FE）ノードのメタデータを同期するために使用されます。Apache Dorisでは、master FEノードのみがメタデータを書き込むことができ、他のFEノードはメタデータ書き込み操作をmasterに転送します。masterがメタデータ書き込み操作を完了した後、非masterノードではメタデータの再生に短い遅延が発生する場合があります。この文を使用してメタデータの強制同期を行うことができます。

## 構文

```sql
SYNC;
```
## Access Control Requirements

すべてのユーザーまたはロールがこの操作を実行できます。


## Examples

メタデータを同期する：

    ```sql
    SYNC;
    ```
