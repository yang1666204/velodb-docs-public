---
{
  "title": "CUT_IPV6",
  "description": "指定されたバイト数を、IPv6アドレスのタイプ（IPv4マップドまたは純粋なIPv6）に基づいて、そのアドレスの末尾から切り取ります。",
  "language": "ja"
}
---
## cut_ipv6

## 説明
IPv6アドレスのタイプ（IPv4マップまたは純粋なIPv6）に基づいて、IPv6アドレスの末尾から指定されたバイト数を切り取り、切り詰められたIPv6アドレス文字列を返します。

## 構文

```sql
CUT_IPV6(<ipv6_address>, <bytes_to_cut_for_ipv6>, <bytes_to_cut_for_ipv4>)
```
### パラメータ
- `<ipv6_address>`: IPv6型のアドレス
- `<bytes_to_cut_for_ipv6>`: 純粋なIPv6アドレスに対してカットするバイト数（TINYINT型）
- `<bytes_to_cut_for_ipv4>`: IPv4マップドアドレスに対してカットするバイト数（TINYINT型）

### 戻り値
戻り値の型: VARCHAR

戻り値の意味:
- 切り詰められたIPv6アドレス文字列を返す
- 入力がIPv4マップドアドレスの場合、`bytes_to_cut_for_ipv4`パラメータを使用する
- 入力が純粋なIPv6アドレスの場合、`bytes_to_cut_for_ipv6`パラメータを使用する
- 3つのパラメータ`<ipv6_address>`、`<bytes_to_cut_for_ipv6>`、`<bytes_to_cut_for_ipv4>`のいずれかがNULLの場合、NULLを返す

### 使用上の注意
- IPv6アドレスがIPv4マップドアドレス（フォーマット`::ffff:IPv4`）かどうかを自動的に検出する
- アドレスタイプに基づいて適切なカットバイト数を選択する
- カット操作はアドレスの末尾から開始し、指定されたバイト数を0に設定する
- パラメータ値は16（IPv6アドレスの総バイト数）を超えることはできない

## 例

純粋なIPv6アドレスから末尾バイトをカットする。

```sql
SELECT cut_ipv6(to_ipv6('2001:db8::1'), 4, 4) as cut_result;
+------------------+
| cut_result       |
+------------------+
| 2001:db8::       |
+------------------+
```
IPv4マップドアドレスから末尾のバイトを切り取ります。

```sql
SELECT cut_ipv6(to_ipv6('::ffff:192.168.1.1'), 4, 4) as cut_result;
+----------------+
| cut_result     |
+----------------+
| ::ffff:0.0.0.0 |
+----------------+
```
異なるカッティングパラメータを使用してください。

```sql
SELECT 
  cut_ipv6(to_ipv6('2001:db8::1'), 8, 4) as ipv6_cut_8,
  cut_ipv6(to_ipv6('::ffff:192.168.1.1'), 4, 8) as ipv4_cut_8;
+------------+------------+
| ipv6_cut_8 | ipv4_cut_8 |
+------------+------------+
| 2001:db8:: | ::         |
+------------+------------+
```
パラメータがNULLの場合、NULLを返します

```sql 
select cut_ipv6(NULL, NULL, NULL);
+----------------------------+
| cut_ipv6(NULL, NULL, NULL) |
+----------------------------+
| NULL                       |
+----------------------------+

select cut_ipv6(to_ipv6("::"), NULL, 0);
+----------------------------------+
| cut_ipv6(to_ipv6("::"), NULL, 0) |
+----------------------------------+
| NULL                             |
+----------------------------------+

select cut_ipv6(to_ipv6("::"), 4, NULL);
+----------------------------------+
| cut_ipv6(to_ipv6("::"), 4, NULL) |
+----------------------------------+
| NULL                             |
+----------------------------------+
```
パラメータ値が範囲外の場合、例外がスローされます。

```sql
SELECT cut_ipv6(to_ipv6('2001:db8::1'), 17, 4);
ERROR 1105 (HY000): errCode = 2, detailMessage = (...)[INVALID_ARGUMENT]Illegal value for argument 2 TINYINT of function cut_ipv6

SELECT cut_ipv6(to_ipv6('2001:db8::1'), 4, 122);
ERROR 1105 (HY000): errCode = 2, detailMessage = (...)[INVALID_ARGUMENT]Illegal value for argument 3 TINYINT of function cut_ipv6
```
### キーワード

CUT_IPV6
