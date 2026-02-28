---
{
  "title": "HLLを使用した近似重複排除",
  "description": "実際のビジネスシナリオにおいて、ビジネスデータの量が増加するにつれて、データ重複排除にかかる負荷も増加しています。",
  "language": "ja"
}
---
## HLL近似重複排除

実際のビジネスシナリオでは、ビジネスデータの量の増加に伴い、データの重複排除に対する圧迫も増加しています。データが一定の規模に達すると、正確な重複排除を使用するコストも増加しています。許容される場合、近似アルゴリズムによって高速な重複排除を実現し、計算圧迫を軽減することは非常に良い方法です。この記事では主に、近似重複排除アルゴリズムとしてDorisが提供するHyperLogLog（略してHLL）について紹介します。

HLLの特徴は、優れた空間複雑度O(mloglogn)、時間複雑度O(n)を持ち、計算結果の誤差は約1%-2%に制御できることです。誤差はデータセットのサイズとハッシュ関数に関連しています。

## HyperLogLogとは

LogLogアルゴリズムのアップグレード版で、その役割は不正確な重複排除カウントを提供することです。その数学的基礎は**ベルヌーイ試行**です。

コインに表と裏があると仮定し、コインを投げて表と裏が出る確率はそれぞれ50%です。表が出るまでコインを投げ続け、これを1回の完全な試行として記録します。

複数のベルヌーイ試行について、回数をnと仮定します。つまり、n回の表が出たということです。ベルヌーイ試行ごとに経験した投げる回数をkとします。最初のベルヌーイ試行では回数をk1とし、以下同様に、n回目はknに対応します。

これらn回のベルヌーイ試行の中で、必ず最大投げ回数kがあります。例えば、12回投げた後に表が出る場合、これをk_maxと呼び、最大投げ回数を表します。

ベルヌーイの実験から次の結論を容易に導き出すことができます：

- n回のベルヌーイプロセスの投げ回数でk_maxより大きいものはありません。
- n回のベルヌーイプロセスで少なくとも1つの投げがk_maxと等しくなります

最終的に、最尤推定法と組み合わせることで、nとk_maxの間に推定相関があることが判明します：n = 2^k_max。**k_maxのみを記録することで、データの総数、すなわち基数を推定できます。**

試行結果が次のようになると仮定します：

- 1回目の試行：3回投げてから表が出る、この時k=3、n=1
- 2回目の試行：2回投げてから表が出る、この時k=2、n=2
- 3回目の試行：6回投げてから表が出る、この時k=6、n=3
- n回目の試行：12回投げてから表が出る、この時点で推定すると、n = 2^12

上記の例の最初の3つのグループの実験を取ると、k_max = 6、最終的にn=3となり、これを推定式に代入すると、明らかに：3 ≠ 2^6。つまり、試行回数が少ない場合、この推定方法の誤差は非常に大きくなります。

これら3セットの試行を1ラウンドの推定と呼びます。1ラウンドのみ実行する場合、nが十分に大きくなると、推定誤差率は相対的に減少しますが、それでも十分に小さくはありません。

## Doris HLL関数

HLLはHyperLogLogアルゴリズムに基づく工学的実装です。HyperLogLog計算プロセスの中間結果を保存するために使用され、Tableの値列タイプとしてのみ使用でき、集約によってデータ量を継続的に削減できます。

クエリの高速化を実現する目的で、これは推定結果に基づいており、誤差は約1%です。hll列は他の列またはインポートされたデータのデータから生成され、インポート時にhll_hash関数を使用します。

データ内のどの列を使用してhll列を生成するかを指定し、しばしばcount distinctの代替として使用され、rollupと組み合わせてビジネスでuvを高速計算するために使用されます。

**HLL_UNION_AGG(hll)**

この関数は、条件を満たすすべてのデータの基数推定を計算する集約関数です。

**HLL_CARDINALITY(hll)**

この関数は、単一のhll列の基数推定を計算するために使用されます

**HLL_HASH(column_name)**

挿入またはインポート用のHLL列タイプを生成します。インポートの使用方法については関連説明を参照してください

## Doris HLLの使用方法

1. HLLを使用して重複排除する場合、Table作成文でターゲット列タイプをHLLに設定し、集約関数をHLL_UNIONに設定する必要があります
2. HLLタイプの列はKey列として使用できません
3. ユーザーは長さとデフォルト値を指定する必要がありません。長さはデータ集約の度合いに応じてシステム内で制御されます

### hll列を持つTableの作成

```sql
create table test_hll(
	dt date,
	id int,
	name char(10),
	province char(10),
	os char(10),
	pv hll hll_union
)
Aggregate KEY (dt,id,name,province,os)
distributed by hash(id) buckets 10
PROPERTIES(
	"replication_num" = "1",
	"in_memory"="false"
);
```
### データのインポート

1. Stream loadインポート

   ```
   curl --location-trusted -u root: -H "label:label_test_hll_load" \
       -H "column_separator:," \
       -H "columns:dt,id,name,province,os, pv=hll_hash(id)" -T test_hll.csv http://fe_IP:8030/api/demo/test_hll/_stream_load
   ```
サンプルデータは以下の通りです（test_hll.csv）：

   ```text
  2022-05-05,10001,Testing01,Beijing,Windows  
  2022-05-05,10002,Testing01,Beijing,Linux  
  2022-05-05,10003,Testing01,Beijing,MacOS  
  2022-05-05,10004,Testing01,Hebei,Windows  
  2022-05-06,10001,Testing01,Shanghai,Windows  
  2022-05-06,10002,Testing01,Shanghai,Linux  
  2022-05-06,10003,Testing01,Jiangsu,MacOS  
  2022-05-06,10004,Testing01,Shaanxi,Windows
   ```
import結果は以下の通りです：

   ```
   # curl --location-trusted -u root: -H "label:label_test_hll_load"     -H "column_separator:,"     -H "columns:dt,id,name,province,os, pv=hll_hash(id)" -T test_hll.csv http://127.0.0.1:8030/api/demo/test_hll/_stream_load
   
   {
       "TxnId": 693,
       "Label": "label_test_hll_load",
       "TwoPhaseCommit": "false",
       "Status": "Success",
       "Message": "OK",
       "NumberTotalRows": 8,
       "NumberLoadedRows": 8,
       "NumberFilteredRows": 0,
       "NumberUnselectedRows": 0,
       "LoadBytes": 320,
       "LoadTimeMs": 23,
       "BeginTxnTimeMs": 0,
       "StreamLoadPutTimeMs": 1,
       "ReadDataTimeMs": 0,
       "WriteDataTimeMs": 9,
       "CommitAndPublishTimeMs": 11
   }
   ```
2. Brokerの負荷

```
LOAD LABEL demo.test_hlllabel
 (
    DATA INFILE("hdfs://hdfs_host:hdfs_port/user/doris_test_hll/data/input/file")
    INTO TABLE `test_hll`
    COLUMNS TERMINATED BY ","
    (dt,id,name,province,os)
    SET (
      pv = HLL_HASH(id)
    )
 );
```
### クエリデータ

HLL列は元の値の直接クエリを許可せず、HLL集計関数を通してのみクエリできます。

1. 総PVを求める

```sql
mysql> select HLL_UNION_AGG(pv) from test_hll;
+---------------------+
| hll_union_agg(`pv`) |
+---------------------+
|                   4 |
+---------------------+
1 row in set (0.00 sec)
```
以下と同等：

```sql
mysql> SELECT COUNT(DISTINCT pv) FROM test_hll;
+----------------------+
| count(DISTINCT `pv`) |
+----------------------+
|                    4 |
+----------------------+
1 row in set (0.01 sec)
```
2. 各日のPVを見つける

```sql
mysql> select HLL_UNION_AGG(pv) from test_hll group by dt;
+---------------------+
| hll_union_agg(`pv`) |
+---------------------+
|                   4 |
|                   4 |
+---------------------+
2 rows in set (0.01 sec)
```
