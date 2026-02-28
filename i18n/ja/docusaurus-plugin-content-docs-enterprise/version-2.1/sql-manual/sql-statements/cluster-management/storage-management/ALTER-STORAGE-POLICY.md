---
{
  "title": "ALTER STORAGE POLICY",
  "description": "この文は既存のホット・コールド階層化マイグレーションポリシーを変更するために使用されます。rootまたはadminユーザーのみがリソースを変更できます。",
  "language": "ja"
}
---
## デスクリプション

このステートメントは、既存のホット・コールド階層化移行ポリシーを変更するために使用されます。rootまたはadminユーザーのみがリソースを変更できます。

## Syntax

```sql
ALTER STORAGE POLICY  '<policy_name>' PROPERTIE ("<key>"="<value>"[, ... ]);
```
## Required パラメータ


1.`<policy_name>`  
> ストレージポリシーの名前。これは変更したいストレージポリシーの一意の識別子であり、既存のポリシー名を指定する必要があります。

## Optional パラメータ
`PROPERTIE ("<key>"="<value>"[, ... ])` 

1.`retention_days`  
> データ保持期間。データがストレージに保持される期間を定義します。この期間を超過したデータは自動的に削除されます。

2.`redundancy_level`
> 冗長性レベル。高可用性と耐障害性を確保するためのデータレプリカ数を定義します。例えば、値が2の場合、各データブロックに2つのレプリカが存在することを意味します。

3.`storage_type`   
> ストレージタイプ。使用するストレージメディアを指定します。SSD、HDD、またはハイブリッドストレージなどがあります。これはパフォーマンスとコストに影響します。

4.`cooloff_time`    
> クールオフ時間。データが削除対象としてマークされてから実際に削除されるまでの時間間隔。これにより、誤操作によるデータ損失を防ぐことができます。

5.`location_policy` 
> 地理的場所ポリシー。災害復旧のための地域横断レプリケーションなど、データの地理的配置を定義します。

## Examples

1. ホット・コールド階層データ移行のcooldown_datetimeを変更する場合：

```sql
ALTER STORAGE POLICY has_test_policy_to_alter PROPERTIES("cooldown_datetime" = "2023-06-08 00:00:00");
```
2. ホット・コールドの階層化データ移行カウントダウンのcooldown_ttlを変更する：

```sql
ALTER STORAGE POLICY has_test_policy_to_alter PROPERTIES ("cooldown_ttl" = "10000");
```
```sql
ALTER STORAGE POLICY has_test_policy_to_alter PROPERTIES ("cooldown_ttl" = "1h");
```
```sql
ALTER STORAGE POLICY has_test_policy_to_alter PROPERTIES ("cooldown_ttl" = "3d");
```
