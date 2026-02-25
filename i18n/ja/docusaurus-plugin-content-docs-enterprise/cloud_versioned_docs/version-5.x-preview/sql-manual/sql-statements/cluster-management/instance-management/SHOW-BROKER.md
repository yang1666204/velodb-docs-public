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
## 出力
| Column         | DateType | Note                                                           |
|----------------|----------|----------------------------------------------------------------|
| Name           | varchar  | Brokerプロセス名                                               |
| Host           | varchar  | BrokerプロセスのノードIP                                       |
| Port           | varchar  | BrokerプロセスのノードPort                                     |
| Alive          | varchar  | BrokerプロセスのノードStatus                                   |
| LastStartTime  | varchar  | Brokerプロセスの最後の開始時刻                                 |
| LastUpdateTime | varchar  | Brokerプロセスの最後の更新時刻                                 |
| ErrMsg         | varchar  | Brokerプロセスの最後の起動失敗時のエラーメッセージ             |


## アクセス制御要件
このステートメントを実行するユーザーには`ADMIN/OPERATOR`権限が必要です。

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
