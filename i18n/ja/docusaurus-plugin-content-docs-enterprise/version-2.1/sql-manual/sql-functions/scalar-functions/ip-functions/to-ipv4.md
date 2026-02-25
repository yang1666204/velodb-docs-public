---
{
  "title": "TO_IPV4",
  "description": "この関数はipv4stringtonumのように、IPv4アドレスの文字列形式を受け取り、IPv4型の値を返します。",
  "language": "ja"
}
---
## Description
この関数は ipv4_string_to_num と同様で、IPv4アドレスの文字列形式を受け取り、IPv4型の値を返します。この値は ipv4_string_to_num が返す値とバイナリレベルで等しくなります。

## Syntax

```sql
TO_IPV4(<ipv4_str>)
```
## Parameters
| Parameter | Description                                      |
|-----------|--------------------------------------------------|
| `<ipv4_str>`      | String型のIPv4アドレス |


## Return Value
IPv4型の値を返します。これはipv4_string_to_numが返す値とバイナリレベルで等しい値です。
- IPv4アドレスの形式が無効な場合、例外をスローします


## Example

```sql
SELECT to_ipv4('255.255.255.255');
```
```text
+----------------------------+
| to_ipv4('255.255.255.255') |
+----------------------------+
| 255.255.255.255            |
+----------------------------+
```
