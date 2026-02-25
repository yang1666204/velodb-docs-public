---
{
  "title": "ALTER WORKLOAD GROUP",
  "description": "このステートメントはworkload groupを変更するために使用されます。",
  "language": "ja"
}
---
## 説明

この文は、ワークロードグループを変更するために使用されます。

## 構文

```sql
ALTER WORKLOAD GROUP  "<rg_name>"
PROPERTIES (
  `<property>`
  [ , ... ]
);
```
## パラメータ

1.`<property>`

`<property>`の形式は`<key>` = `<value>`で、`<key>`の具体的な選択可能な値についてはworkload groupを参照してください。

## 例

1. g1という名前のworkload groupを変更する：

    ```sql
    alter workload group g1
    properties (
        "max_cpu_percent"="20%",
        "max_memory_percent"="40%"
    );
    ```
