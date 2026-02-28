---
{
  "title": "IPV6_STRING_TO_NUM",
  "description": "IPv6NumToStringの逆関数で、IPアドレスのStringを受け取り、バイナリ形式のIPv6アドレスを返します。",
  "language": "ja"
}
---
## 説明
IPv6NumToStringの逆関数で、IPアドレス文字列を受け取り、バイナリ形式のIPv6アドレスを返します。

## 構文

```sql
IPV6_STRING_TO_NUM(<ipv6_string>)
```
## パラメータ
| Parameter | デスクリプション                                      |
|-----------|--------------------------------------------------|
| `<ipv6_string>`      | String型のIPv6アドレス  |

## Return Value
バイナリ形式のIPv6アドレスを返します。
- 入力文字列が有効なIPアドレスでない場合や`NULL`の場合はエラーを返します
- 入力文字列が有効なIPv4アドレスを含む場合、そのIPv6相当を返します。

## Example

```sql
select hex(ipv6_string_to_num('1111::ffff')), hex(ipv6_string_to_num('192.168.0.1'));
```
```text
+---------------------------------------+----------------------------------------+
| hex(ipv6_string_to_num('1111::ffff')) | hex(ipv6_string_to_num('192.168.0.1')) |
+---------------------------------------+----------------------------------------+
| 1111000000000000000000000000FFFF      | 00000000000000000000FFFFC0A80001       |
+---------------------------------------+----------------------------------------+
```
```sql
select hex(ipv6_string_to_num('notaaddress'));
```
```text
ERROR 1105 (HY000): errCode = 2, detailMessage = (172.17.0.2)[CANCELLED][E33] Invalid IPv6 value
```
