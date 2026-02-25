---
{
  "title": "IPV6_STRING_TO_NUM",
  "description": "IPv6NumToStringの逆関数で、IPアドレス文字列を受け取り、IPv6アドレスをバイナリ形式で返します。",
  "language": "ja"
}
---
## ipv6_string_to_num

## 説明
IPv6NumToStringの逆関数で、IPアドレス文字列を受け取り、IPv6アドレスをバイナリ形式で返します。

## 構文

```sql
IPV6_STRING_TO_NUM(<ipv6_string>)
```
### パラメータ
- `<ipv6_string>`: 文字列型のIPv6アドレス

### 戻り値
戻り値の型: VARCHAR (16バイトバイナリ)

戻り値の意味:
- IPv6の16バイトバイナリエンコーディングを返します
- 入力がNULLの場合は例外をスローします
- 無効なIPアドレスまたは`NULL`入力に対して例外をスローします
- 入力が有効なIPv4テキストの場合、等価なIPv6アドレス（`::ffff:<ipv4>`）を返します

### 使用上の注意
- 標準的なIPv6テキスト（省略形および`::` 省略形を含む）をサポートします
- 入力が有効なIPv4テキストの場合、IPv6のIPv4-Mapped表現に変換して返します
- CIDR、ポート、角括弧などの拡張形式はサポートしていません

## 例

IPv6テキスト`1111::ffff`を16バイトバイナリに変換します（16進数で表示）。

```sql
select hex(ipv6_string_to_num('1111::ffff')) as v6;
+----------------------------------+
| v6                               |
+----------------------------------+
| 1111000000000000000000000000FFFF |
+----------------------------------+
```
IPv4テキストは自動的にIPv6（`::ffff:<ipv4>`）にマップされ、16バイトのバイナリとして返されます。

```sql
select hex(ipv6_string_to_num('192.168.0.1')) as mapped;
+----------------------------------+
| mapped                           |
+----------------------------------+
| 00000000000000000000FFFFC0A80001 |
+----------------------------------+
```
入力がNULLの場合、例外がスローされます

```sql
select hex(ipv6_string_to_num(NULL));
ERROR 1105 (HY000): errCode = 2, detailMessage = (...)[INVALID_ARGUMENT]Null Input, you may consider convert it to a valid default IPv6 value like '::' first
```
無効な入力は例外をスローします。

```sql
select hex(ipv6_string_to_num('notaaddress'));
ERROR 1105 (HY000): errCode = 2, detailMessage = (...)[INVALID_ARGUMENT]Invalid IPv6 value
```
### キーワード

IPV6_STRING_TO_NUM
