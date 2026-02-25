---
{
  "title": "SHOW BROKER",
  "description": "この文は、現在存在するbrokerプロセスのステータスを表示するために使用されます。",
  "language": "ja"
}
---
## 説明

このステートメントは、現在存在するbrokerプロセスのステータスを表示するために使用されます。

## 構文：

```sql
SHOW BROKER;
```
## Output
| Column         | DateType | Note                                                           |
|----------------|----------|----------------------------------------------------------------|
| Name           | varchar  | Brokerプロセス名                                                |
| Host           | varchar  | BrokerプロセスノードIP                                           |
| Port           | varchar  | BrokerプロセスノードPort                                         |
| Alive          | varchar  | BrokerプロセスノードStatus                                       |
| LastStartTime  | varchar  | Brokerプロセス最終開始時刻                                        |
| LastUpdateTime | varchar  | Brokerプロセス最終更新時刻                                        |
| ErrMsg         | varchar  | Brokerプロセスの最後に失敗した起動のエラーメッセージ                   |


## アクセス制御要件
この文を実行するユーザーは`ADMIN/OPERATOR`権限を持つ必要があります。

## 例

1. 現在存在するbrokerプロセスのステータスを表示

    ```sql
    show broker;
    ```
    ```text
    +-------------+------------+------+-------+---------------------+---------------------+--------+
    | Name        | Host       | Port | Alive | LastStartTime       | LastUpdateTime      | ErrMsg |
    +-------------+------------+------+-------+---------------------+---------------------+--------+
    | broker_test | 10.10.10.1 | 8196 | true  | 2025-01-21 11:30:10 | 2025-01-21 11:31:40 |        |
    +-------------+------------+------+-------+---------------------+---------------------+--------+
    ```
