---
{
  "title": "NULL",
  "description": "行内のカラムに値がない場合、そのカラムはNULLであると言われます。NULLは「NOT NULL」制約によって制限されていないあらゆるカラムに現れることができます。",
  "language": "ja"
}
---
## NULLの基本紹介

行内のカラムに値がない場合、そのカラムはNULLであると言われます。NULLは「NOT NULL」制約によって制限されていないすべてのカラムに現れることがあります。実際の値が不明な場合や、値に意味がない場合にNULLを使用してください。

数値のゼロや空文字列を表すためにNULLを使用しないでください。これらは等価ではありません。

NULLを含むすべての算術式は常にNULLになります。例えば、NULLに10を加算してもNULLになります。実際、NULLがオペランドとして与えられた場合、すべての演算子はNULLを返します。

## 関数引数としてのNULL

NULLが引数として提供された場合、ほとんどの集約関数はNULLを返します。NULL値が発生した際に値を返すためにIFNULL関数を使用できます。例えば、IFNULL(arg, 0)という式は、argがNULLの場合は0を返し、argがNULLでない場合はその値を返します。各関数の具体的な動作については、「Functions」セクションを参照してください。

## NULLと比較演算子

NULLの結果をテストするには、IS NULLとIS NOT NULLの比較条件のみを使用できます。NULLに依存する条件が使用された場合、結果はUNKNOWNになります。NULLは欠損データを表すため、NULLはいかなる値や他のNULLとも等しくなったり等しくなくなったりすることはできません。

## 条件内のNULL

UNKNOWNと評価される条件は、FALSEとほぼ同じように動作します。例えば、WHERE句でUNKNOWNと評価される条件を持つSELECT文は、いかなる行も返しません。ただし、UNKNOWNと評価される条件とFALSEとの違いは、UNKNOWN条件の評価結果に対するさらなる操作もUNKNOWNと評価されることです。したがって、NOT FALSEの計算結果はTRUEですが、NOT UNKNOWNの計算結果はUNKNOWNです。

下表は、条件内でNULLを含む様々な評価の例を示しています。UNKNOWNと評価される条件がSELECT文のWHERE句で使用された場合、クエリは行を返しません。

| **Condition**   | **Value of A** | **Evaluation** |
| :-------------- | :------------- | :------------- |
| `a IS NULL`     | `10`           | `FALSE`        |
| `a IS NOT NULL` | `10`           | `TRUE`         |
| `a IS NULL`     | `NULL`         | `TRUE`         |
| `a IS NOT NULL` | `NULL`         | `FALSE`        |
| `a = NULL`      | `10`           | `UNKNOWN`      |
| `a != NULL`     | `10`           | `UNKNOWN`      |
| `a = NULL`      | `NULL`         | `UNKNOWN`      |
| `a != NULL`     | `NULL`         | `UNKNOWN`      |
| `a = 10`        | `NULL`         | `UNKNOWN`      |
| `a != 10`       | `NULL`         | `UNKNOWN`      |
