---
{
  "title": "Atomic Tableの置き換え",
  "description": "Dorisは2つのTable間でのアトミックな置換操作をサポートしており、OLAPTableにのみ適用可能です。",
  "language": "ja"
}
---
Dorisは2つのTable間でのアトミック置換操作をサポートしており、OLAPTableにのみ適用されます。

## 適用シナリオ

ユーザーがTableデータを書き換える必要がある場合がありますが、削除してからデータをインポートすると利用不可の期間が発生します。このような場合、ユーザーは`CREATE TABLE LIKE`文を使用して同じ構造の新しいTableを作成し、新しいデータを新しいTableにインポートしてから、古いTableのアトミック置換を実行できます。パーティションレベルのアトミック上書き操作については、[temporary partition documentation](../delete/table-temp-partition)を参照してください。

## 構文

```Plain
ALTER TABLE [db.]tbl1 REPLACE WITH TABLE tbl2
[PROPERTIES('swap' = 'true')];
```
Table`tbl1`をTable`tbl2`に置き換えます。

`swap`パラメータが`true`の場合、置き換え後、`tbl1`のデータは元の`tbl2`のデータとなり、`tbl2`のデータは元の`tbl1`のデータとなります。つまり、2つのTableのデータが交換されます。

`swap`パラメータが`false`の場合、置き換え後、`tbl1`のデータは元の`tbl2`のデータとなり、`tbl2`は削除されます。

## 原理

Table置き換え機能は、以下の一連の操作をアトミック操作に変換します。

TableAをTableBに置き換え、`swap`が`true`の場合、操作は以下の通りです：

1. TableBをTableAにリネームする
2. TableAをTableBにリネームする

`swap`が`false`の場合、操作は以下の通りです：

1. TableAを削除する
2. TableBをTableAにリネームする

## 注意事項

- `swap`パラメータが`false`の場合、置き換えられるTable（TableA）は削除され、復元できません。
- 置き換え操作は2つのOLAPTable間でのみ実行可能で、Table構造の一貫性はチェックされません。
- 置き換え操作は元の権限設定を変更しません。権限チェックはTable名に基づいて行われるためです。
