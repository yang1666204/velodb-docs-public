---
{
  "title": "データアクセス制御",
  "description": "Dorisの行レベルポリシーを使用することで、機密データに対するきめ細かいアクセス制御を実現できます。",
  "language": "ja"
}
---
## Row Permissions

DorisのRow Policyを使用することで、機密データに対してきめ細かいアクセス制御を実現できます。テーブルレベルで定義されたセキュリティポリシーに基づいて、どのユーザーまたはロールがテーブル内の特定のレコードにアクセスできるかを決定できます。

### メカニズム

Row Policyが設定されたユーザーがクエリを実行する際に、Row Policyで設定された述語を自動的に追加することと同等です。

### 制限事項

デフォルトユーザーのrootとadminにはRow Policyを設定できません。

### 関連コマンド
- Row Permission Policiesの表示 [SHOW ROW POLICY](../../../sql-manual/sql-statements/data-governance/SHOW-ROW-POLICY.md)
- Row Permission Policyの作成 [CREATE ROW POLICY](../../../sql-manual/sql-statements/data-governance/CREATE-ROW-POLICY.md)

### Row Permission例
1. testユーザーがtable1でc1='a'のデータのみクエリできるよう制限する

```sql
CREATE ROW POLICY test_row_policy_1 ON test.table1 
AS RESTRICTIVE TO test USING (c1 = 'a');
```
## カラム権限
Doris のカラム権限を使用すると、テーブルに対してきめ細かなアクセス制御を実現できます。テーブル内の特定のカラムに権限を付与して、どのユーザーまたはロールがテーブル内の特定のカラムにアクセスできるかを決定できます。

現在、カラム権限は Select_priv のみをサポートしています。

### 関連コマンド
- Grant: [GRANT](../../../sql-manual/sql-statements/account-management/GRANT-TO)
- Revoke: [REVOKE](../../../sql-manual/sql-statements/account-management/REVOKE-FROM.md)

### カラム権限の例

1. user1 にテーブル tbl のカラム col1 と col2 をクエリする権限を付与する。

```sql
GRANT Select_priv(col1,col2) ON ctl.db.tbl TO user1
```
## Data Masking
Data maskingは、元のデータを修正、置換、または隠すことで機密データを保護する手法であり、マスクされたデータが機密情報を含まなくなる一方で、特定のフォーマットや特性を維持します。

例えば、管理者はクレジットカード番号やID番号などの機密フィールドの一部または全部の数字をアスタリスク*や他の文字に置き換えたり、実名を仮名に置き換えたりすることを選択できます。

バージョン2.1.2以降、Apache RangerのData Maskingを通じてdata maskingがサポートされ、特定の列にマスキングポリシーを設定できますが、現在は[Apache Ranger](./ranger.md)を通じてのみ可能です。

> admin/rootユーザーのData Masking設定は有効になりません。
