---
{
  "title": "I'm ready to translate the English technical documentation into Japanese following your specified rules and requirements. However, I don't see the actual text content between the \"JSON_QUOTE\" markers that you mentioned. \n\nCould you please provide the English technical documentation text that you'd like me to translate?",
  "description": "入力文字列パラメータを二重引用符で囲み、文字列内の特殊文字と制御文字をエスケープします。",
  "language": "ja"
}
---
## 説明
入力文字列パラメータをダブルクォートで囲み、文字列内の特殊文字と制御文字をエスケープします。この関数の主な目的は、文字列を有効なJSON文字列に変換することです。

特殊文字には以下が含まれます：
* クォート (`"`)
* バックスラッシュ (`\`)
* バックスペース (`\b`)
* 改行 (`\n`)
* 復帰文字 (`\r`)
* 水平タブ (`\t`)

制御文字には以下が含まれます：
* `CHAR(0)` は `\u0000` としてエスケープされます

## 構文

```sql
JSON_QUOTE (<str>)
```
## Parameters
`<str>` String型、クォートする値。

## Return Value
ダブルクォートで囲まれた文字列を返す

## Usage Notes
- パラメータがNULLの場合、NULLを返す。
- パラメータにエスケープシンボル（`\`）+ 非エスケープ文字が含まれている場合、エスケープシンボルは削除される。例4と5を参照。

## Examples
1. ダブルクォートはエスケープされる

    ```sql
    select json_quote('I am a "string" that contains double quotes.');
    ```
    ```
    +------------------------------------------------------------+
    | json_quote('I am a "string" that contains double quotes.') |
    +------------------------------------------------------------+
    | "I am a \"string\" that contains double quotes."           |
    +------------------------------------------------------------+
    ```
2. 特殊文字のエスケープ

    ```sql
    select json_quote("\\ \b \n \r \t");
    ```
    ```
    +------------------------------+
    | json_quote("\\ \b \n \r \t") |
    +------------------------------+
    | "\\ \b \n \r \t"             |
    +------------------------------+
    ```
3. 制御文字のエスケープ

    ```sql
    select json_quote("\0");
    ```
    ```
    +------------------+
    | json_quote("\0") |
    +------------------+
    | "\u0000"         |
    +------------------+
    ```
4. エスケープシンボル + 非エスケープ文字の場合

    ```sql
    select json_quote("\a");
    ```
    ```
    +------------------+
    | json_quote("\a") |
    +------------------+
    | "a"              |
    +------------------+
    ```
5. ゼロ以外の印刷不可文字

    ```sql
    select json_quote("\1");
    ```
    ```
    +------------------+
    | json_quote("\1") |
    +------------------+
    | "1"              |
    +------------------+
    ```
