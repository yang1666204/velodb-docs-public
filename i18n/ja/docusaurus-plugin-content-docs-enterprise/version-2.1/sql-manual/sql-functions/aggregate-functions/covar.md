---
{
  "title": "COVAR,COVAR_POP",
  "description": "2つの数値変数間の共分散を計算します。",
  "language": "ja"
}
---
## 説明

2つの数値変数間の共分散を計算します。

## エイリアス

- COVAR_POP

## 構文

```sql
COVAR(<expr1>, <expr2>)
```
## パラメータ

| Parameter | Description |
| -- | -- |
| `<expr1>` | 数値式または列 |
| `<expr2>` | 数値式または列 |

## 戻り値

expr1とexpr2の共分散値を返します。特殊なケース：

- expr1またはexpr2の列がNULLの場合、その行のデータは最終結果にカウントされません。

## 例

```
select covar(x,y) from baseall;
```
```text
+---------------------+
| covar(x, y)          |
+---------------------+
| 0.89442719099991586 |
+---------------------+
```
