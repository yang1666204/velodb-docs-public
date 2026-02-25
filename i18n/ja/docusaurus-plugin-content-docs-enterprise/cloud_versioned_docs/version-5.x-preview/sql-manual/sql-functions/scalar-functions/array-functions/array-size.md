---
{
  "title": "ARRAY_SIZE",
  "description": "配列内の要素数を返します。",
  "language": "ja"
}
---
## Function

配列の要素数を返します。

## Syntax

- `ARRAY_SIZE(arr)`

## Parameters

- `arr`: `ARRAY<T>`。

## Return value

- `arr`に含まれる要素数を返します。

## Usage notes

- 入力`arr`が`NULL`の場合、`NULL`を返します。

## Examples

- 配列：
  - `ARRAY_SIZE([1, 2, 3])` -> `3`
  - `ARRAY_SIZE(['a', NULL, 'b'])` -> `3`

- 入力`arr`が`NULL`の場合、`NULL`を返します
  - `ARRAY_SIZE(NULL)` -> `NULL`
