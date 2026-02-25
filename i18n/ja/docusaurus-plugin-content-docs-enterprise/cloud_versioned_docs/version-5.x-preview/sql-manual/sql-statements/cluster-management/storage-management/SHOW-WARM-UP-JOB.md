---
{
  "title": "SHOW WARM UP JOBの表示",
  "description": "このコマンドはDorisでウォームアップジョブを表示するために使用されます。",
  "language": "ja"
}
---
## Description

これらのコマンドは、Dorisでウォームアップジョブを表示するために使用されます。

## Syntax

```sql
   SHOW WARM UP JOB [ WHERE id = 'id' ] ;
```
## Parameters


| Parameter Name                  | Description                                                         |
|---------------------------|--------------------------------------------------------------|
| id                        | warm-upジョブのID                                                |
## Examples

1. すべてのwarm-upジョブを表示する：

 ```sql
    SHOW WARM UP JOB;
```
2. ID 13418のウォームアップジョブを表示する：

```sql
    SHOW WARM UP JOB WHERE id = 13418;
```
## 関連コマンド

 - [WARMUP COMPUTE GROUP](./WARM-UP.md)
