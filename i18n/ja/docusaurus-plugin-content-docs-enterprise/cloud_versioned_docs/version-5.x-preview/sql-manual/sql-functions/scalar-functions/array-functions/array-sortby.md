---
{
  "title": "ARRAY_SORTBY",
  "description": "keys配列の順序に従ってvalues配列をソートします。",
  "language": "ja"
}
---
## Function

`keys`配列の順序に従って`values`配列をソートします。
- 例えば、`keys`が`[3, 0, 2]`で`values`が`[5, 7, 8]`の場合、ソート後に`keys`は`[0, 2, 3]`となり、対応する`values`は`[7, 8, 5]`となります。

## Syntax

- `ARRAY_SORTBY(values, keys)`
- `ARRAY_SORTBY(lambda, values)`
- `ARRAY_SORTBY(lambda, values)`は`ARRAY_SORTBY(values, ARRAY_MAP(lambda, values))`と等価です

## Parameters

- `values`: `ARRAY<T>`、ソート対象の値配列。`T`は数値、真偽値、文字列、日時、IPなどをサポートします。
- `keys`: `ARRAY<T>`、`values`と同じ長さのキー配列。`T`は数値、真偽値、文字列、日時、IPなどをサポートします。
- `lambda`: `values`に適用してソート用の`keys`配列を生成する`lambda`式。

## Return value

- `values`と同じ型の`ARRAY<T>`を返します。
- 任意の行で`values`と`keys`の要素数が異なる場合、エラーが発生します。

## Usage notes

- 安定性: `values`は`keys`の昇順で並び替えられます。等しいキー間の相対順序は未定義です。
- 高階呼び出しでは、`ARRAY_MAP`によって最初に`keys`が計算され、その後`keys`によって`values`がソートされます。

## Examples

- 基本: `keys`の昇順で`values`をソートします。
  - `ARRAY_SORTBY([10,20,30], [3,1,2])` -> `[20,30,10]`
  - `ARRAY_SORTBY(['a','b','c'], [2,2,1])` -> `['c','a','b]`

- 高階: `lambda`を使って`keys`を計算し、その後ソートします。
  - `ARRAY_SORTBY(x -> x + 1, [3,1,2])` -> `[1,2,3]` (`keys`は`[4,2,3]`)
  - `ARRAY_SORTBY(x -> x*2 <= 2, [1,2,3])` -> `[1,2,3]` (`keys`は`[true,false,false]`)

- `keys`または`values`が`NULL`の場合、`values`をそのまま返します。
  - `array_sortby([10,20,30], NULL)` -> `[10, 20, 30]`
  - `array_sortby(NULL, [2,3])` -> `NULL`
