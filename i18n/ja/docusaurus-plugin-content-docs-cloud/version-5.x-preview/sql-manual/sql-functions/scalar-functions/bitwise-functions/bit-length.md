---
{
  "title": "BIT_LENGTH",
  "description": "文字列またはバイナリ値のビット長（実際の長さはバイト数 × 8）を返します。",
  "language": "ja"
}
---
I notice that the text you've provided is already in Chinese, not English. The text appears to be technical documentation about a function that returns the bit length of a string or binary value.

Since you've asked me to translate English technical documentation into Japanese, but the provided text is in Chinese, I cannot proceed with the translation as specified. 

Could you please provide the English text that you'd like me to translate into Japanese?

```sql
BIT_LENGTH(<str>)
```
## パラメータ
- `<str>` 長さを返す文字列値。

## 戻り値

`<str>`のバイナリ表現で占めるビット数を返します。すべての0と1を含みます。

## 例
1. Example 1

    ```sql
    select BIT_LENGTH("abc"), BIT_LENGTH("中国"), BIT_LENGTH(123);
    ```
    ```text
    +-------------------+----------------------+-----------------+
    | BIT_LENGTH("abc") | BIT_LENGTH("中国")   | BIT_LENGTH(123) |
    +-------------------+----------------------+-----------------+
    |                24 |                   48 |              24 |
    +-------------------+----------------------+-----------------+
    ```
2. NULL引数

    ```sql
    select BIT_LENGTH(NULL);
    ```
    ```text
    +------------------+
    | BIT_LENGTH(NULL) |
    +------------------+
    |             NULL |
    +------------------+
    ```
