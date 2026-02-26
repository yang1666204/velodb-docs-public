---
{
  "title": "データアクセス制御",
  "description": "Dorisの行レベルポリシーを使用することで、機密データに対してきめ細かいアクセス制御を実現できます。",
  "language": "ja"
}
---
# データアクセス制御

## 行権限

Dorisの行レベルポリシーにより、機密データに対するきめ細かいアクセス制御を実現できます。テーブルレベルで定義されたセキュリティポリシーに基づいて、どのユーザーまたはロールがテーブル内の特定のレコードにアクセスできるかを決定できます。

### メカニズム

Row Policyが設定されたユーザーがクエリを実行する際に、Row Policyで設定された述語セットを自動的に追加することと同等です。

### 制限事項

デフォルトユーザーのrootとadminに対してはRow Policyを設定できません。

### 関連コマンド
- 行権限ポリシーの表示 [SHOW ROW POLICY](../../../sql-manual/sql-statements/data-governance/SHOW-ROW-POLICY)
- 行権限ポリシーの作成 [CREATE ROW POLICY](../../../sql-manual/sql-statements/data-governance/CREATE-ROW-POLICY)

### 行権限の例
1. testユーザーがtable1でc1='a'のデータのみをクエリできるよう制限する

```sql
CREATE ROW POLICY test_row_policy_1 ON test.table1 
AS RESTRICTIVE TO test USING (c1 = 'a');
```
## カラムパーミッション
Dorisのカラムパーミッションを使用することで、テーブルに対するきめ細かいアクセス制御を実現できます。テーブル内の特定のカラムに対してパーミッションを付与することで、どのユーザーまたはロールがテーブル内の特定のカラムにアクセスできるかを決定できます。

現在、カラムパーミッションはSelect_privのみをサポートしています。

### 関連コマンド
- 付与: [GRANT](../../../sql-manual/sql-statements/account-management/GRANT-TO)
- 取り消し: [REVOKE](../../../sql-manual/sql-statements/account-management/REVOKE-FROM)

### カラムパーミッションの例

1. user1にテーブルtbl内のカラムcol1とcol2をクエリするパーミッションを付与する。

```sql
GRANT Select_priv(col1,col2) ON ctl.db.tbl TO user1
```
## Data Masking
Data Maskingは、元のデータを変更、置換、または隠すことで機密データを保護する手法であり、マスクされたデータが機密情報を含まなくなる一方で、特定の形式と特性を維持します。

例えば、管理者はクレジットカード番号やID番号などの機密フィールドの数字の一部または全部をアスタリスク*や他の文字で置換したり、実名を仮名で置換することを選択できます。

バージョン2.1.2以降、Apache RangerのData Maskingを通じて特定のカラムにマスキングポリシーを設定するData Maskingがサポートされており、現在は[Apache Ranger](./ranger.md)を通じてのみ利用可能です。

> admin/rootユーザーのData Masking設定は有効になりません。
