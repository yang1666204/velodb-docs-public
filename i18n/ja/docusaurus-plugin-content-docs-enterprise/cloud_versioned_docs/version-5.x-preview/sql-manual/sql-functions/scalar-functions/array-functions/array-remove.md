---
{
  "title": "ARRAY_REMOVE",
  "description": "配列から指定された値と等しい全ての要素を削除し、残りの要素の相対的な順序を保持します。",
  "language": "ja"
}
---
## Function

指定された値と等しいすべての要素を配列から削除し、残りの要素の相対的な順序を保持します。

## Syntax

- `ARRAY_REMOVE(arr, target)`

## Parameters

- `arr`: `ARRAY<T>`、数値、boolean、文字列、datetime、IPなどをサポート。
- `target`: 配列要素と同じ型の値で、削除する要素とのマッチングに使用されます。

## Return value

- 入力と同じ型の`ARRAY<T>`を返します。
- `arr`が`NULL`の場合、`NULL`を返します。

## Usage notes

- マッチングルール: `target`と値が等しい要素のみが削除されます。`NULL`は`NULL`と等しくなります。

## Examples

- Basic: 削除後、残りの要素は元の相対的な順序を保持します。
  - `ARRAY_REMOVE([1,2,3], 1)` -> `[2,3]`
  - `ARRAY_REMOVE([1,2,3,null], 1)` -> `[2,3,null]`

- `target`が`NULL`の場合、`arr`内の`NULL`を削除します。
  - `ARRAY_REMOVE(['a','b','c',NULL], NULL)` -> `NULL`

- `arr`が`NULL`の場合、`NULL`を返します
  - `ARRAY_REMOVE(NULL, 2)` -> `NULL`

- マッチしない場合
  - `ARRAY_REMOVE([1,2,3], 258)` -> `[1,2,3]`
