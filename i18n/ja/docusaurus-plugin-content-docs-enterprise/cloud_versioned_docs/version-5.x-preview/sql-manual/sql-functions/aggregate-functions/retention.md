---
{
  "title": "保持",
  "description": "retention関数は、特定の条件が満たされたかどうかを示すBool型の1から32個の引数からなる条件セットを引数として受け取ります",
  "language": "ja"
}
---
## 説明

`retention`関数は、イベントに対して特定の条件が満たされたかどうかを示すBool型の1から32個の引数からなる条件のセットを引数として受け取ります。任意の条件を引数として指定できます。

最初以外の条件はペアで適用されます。2番目の結果は1番目と2番目がtrueの場合にtrueになり、3番目の結果は1番目と3番目がtrueの場合にtrueになる、といったように動作します。

簡単に言うと、戻り値の配列の最初の桁は`event_1`がtrueかfalseかを示し、2番目の桁は`event_1`と`event_2`の真偽を表し、3番目の桁は`event_1`がtrueかfalseかと`event_3`がtrueかfalseかを表す、といったように続きます。`event_1`がfalseの場合は、falseで満たされた配列を返します。

## 構文

```sql
RETENTION(<event_1> [, <event_2>, ... , <event_n>]);
```
## パラメータ

| パラメータ | 説明 |
| -- | -- |
| `<event_n>` | `n`番目のイベント条件、型はBool。 |

## 戻り値
- true: 条件が満たされている。
- false: 条件が満たされていない。
最大長32のBool配列で、最終的な出力配列の長さは入力パラメータの長さと一致します。
集約にデータが関与しない場合、NULL値が返されます。
計算で複数の列が関与する場合、いずれかの列にNULL値が含まれていると、NULL値を持つ現在の行は集約計算に参加せず、直接破棄されます。
計算列でIFNULL関数を使用してNULL値を処理できます。詳細については、後続の例を参照してください。

## 例

1. サンプルテーブルを作成してサンプルデータを挿入

```sql
CREATE TABLE retention_test(
    `uid` int COMMENT 'user id', 
    `date` datetime COMMENT 'date time' 
) DUPLICATE KEY(uid) 
DISTRIBUTED BY HASH(uid) BUCKETS AUTO
PROPERTIES ( 
    "replication_allocation" = "tag.location.default: 1"
);

INSERT into retention_test values 
(0, '2022-10-12'),
(0, '2022-10-13'),
(0, '2022-10-14'),
(1, '2022-10-12'),
(1, '2022-10-13'),
(2, '2022-10-12');
```
2. ユーザーリテンションを計算する

```sql
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
3. 特殊ケースでのNULL値の処理、テーブルの再作成とデータの挿入

```sql
CREATE TABLE retention_test2(
    `uid` int, 
    `flag` boolean,
    `flag2` boolean
) DUPLICATE KEY(uid) 
DISTRIBUTED BY HASH(uid) BUCKETS AUTO
PROPERTIES ( 
    "replication_allocation" = "tag.location.default: 1"
);

INSERT into retention_test2 values (0, false, false), (1, true,  NULL);

SELECT * from retention_test2;
```
```text
+------+------+-------+
| uid  | flag | flag2 |
+------+------+-------+
|    0 |    1 |  NULL |
|    1 |    0 |     0 |
+------+------+-------+
```
4. 空のテーブルで計算を実行する場合、集約にデータが参加せず、NULL値が返されます。

```sql
SELECT RETENTION(date = '2022-10-12') AS r FROM retention_test2 where uid is NULL;
```
```text
+------+
| r    |
+------+
| NULL |
+------+
```
5. flag列のみが計算に関与します。uid = 0の場合flagがtrueになるため、1を返します。

```sql
select retention(flag) from retention_test2;
```
```text
+-----------------+
| retention(flag) |
+-----------------+
| [1]             |
+-----------------+
```
6. カラムflagとflag2が計算に関与する場合、uid = 0の行はflag2がNULLであるため、集計計算から除外されます。uid = 1の行のみが集計に参加し、戻り値は0となります。

```sql
select retention(flag,flag2) from retention_test2;
```
```text
+-----------------------+
| retention(flag,flag2) |
+-----------------------+
| [0, 0]                |
+-----------------------+
```
7. NULL値の問題を解決するには、IFNULL関数を使用してNULLをfalseに変換することで、uid = 0とuid = 1の両方の行が集計計算に含まれるようにできます。

```sql
select retention(flag,IFNULL(flag2,false)) from retention_test2;;
```
```text
+-------------------------------------+
| retention(flag,IFNULL(flag2,false)) |
+-------------------------------------+
| [1, 0]                              |
+-------------------------------------+
```
