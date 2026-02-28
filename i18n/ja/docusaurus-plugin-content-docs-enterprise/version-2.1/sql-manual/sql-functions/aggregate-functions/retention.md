---
{
  "title": "RETENTION",
  "description": "retention関数は、特定の条件が満たされたかどうかを示すUInt8型の1から32個の引数からなる条件セットを引数として受け取ります。",
  "language": "ja"
}
---
## 説明

`retention`関数は、イベントに対して特定の条件が満たされたかどうかを示す`UInt8`型の1から32個の引数からなる条件のセットを引数として受け取ります。任意の条件を引数として指定できます。

最初の条件を除き、条件はペアで適用されます。2番目の結果は、1番目と2番目が真の場合に真となり、3番目は1番目と3番目が真の場合に真となります。以降も同様です。

簡単に言うと、戻り値配列の最初の桁は`event_1`が真か偽かを示し、2番目の桁は`event_1`と`event_2`の真偽を表し、3番目の桁は`event_1`が真か偽か、および`event_3`が真か偽かを表します。以降も同様です。`event_1`が偽の場合、全てがゼロの配列を返します。

## 構文

```sql
RETENTION(<event_1> [, <event_2>, ... , <event_n>]);
```
## パラメータ

| Parameter | デスクリプション |
| -- | -- |
| `<event_n>` | `n`番目のイベント条件。型は`UInt8`で、値は1または0です。 |

## Returned value

最大長32の1と0の配列。最終的な出力配列の長さは入力パラメータの長さと一致します。

- 1: 条件が満たされている。
- 0: 条件が満たされていない。

## Examples

```sql
-- Create sample table
CREATE TABLE retention_test(
    `uid` int COMMENT 'user id', 
    `date` datetime COMMENT 'date time' 
) DUPLICATE KEY(uid) 
DISTRIBUTED BY HASH(uid) BUCKETS AUTO
PROPERTIES ( 
    "replication_allocation" = "tag.location.default: 1"
);

-- Insert sample data
INSERT into retention_test values 
(0, '2022-10-12'),
(0, '2022-10-13'),
(0, '2022-10-14'),
(1, '2022-10-12'),
(1, '2022-10-13'),
(2, '2022-10-12');

-- Calculate user retention
SELECT 
    uid,     
    RETENTION(date = '2022-10-12') AS r,
    RETENTION(date = '2022-10-12', date = '2022-10-13') AS r2,
    RETENTION(date = '2022-10-12', date = '2022-10-13', date = '2022-10-14') AS r3 
FROM retention_test 
GROUP BY uid 
ORDER BY uid ASC;
```
```text
+------+------+--------+-----------+
| uid  | r    | r2     | r3        |
+------+------+--------+-----------+
|    0 | [1]  | [1, 1] | [1, 1, 1] |
|    1 | [1]  | [1, 1] | [1, 1, 0] |
|    2 | [1]  | [1, 0] | [1, 0, 0] |
+------+------+--------+-----------+
```
