---
{
  "title": "概要 | システム Tables",
  "description": "Apache Dorisクラスターには、Dorisシステム自体のメタデータ情報を格納するための複数の組み込みシステムデータベースがあります。",
  "language": "ja"
}
---
# 概要

Apache Dorisクラスターには、Dorisシステム自体に関するメタデータ情報を保存するために、複数の組み込みシステムデータベースがあります。

### information_schema

`information_schema`データベース配下のすべてのTableは仮想Tableであり、物理的な実体を持ちません。これらのシステムTableには、Dorisクラスターとそのすべてのデータベースオブジェクト（データベース、Table、カラム、権限など）に関するメタデータが含まれています。また、Workload Group、Taskなどの機能ステータス情報も含まれています。

各Catalog配下には`information_schema`データベースがあり、対応するCatalogのデータベースとTableのメタデータのみが含まれています。

`information_schema`データベース内のすべてのTableは読み取り専用であり、ユーザーはこのデータベース内のTableを変更、削除、作成することはできません。

デフォルトでは、すべてのユーザーがこのデータベース内のすべてのTableに対して読み取り権限を持っていますが、クエリ結果はユーザーの実際の権限に基づいて異なります。例えば、User Aが`db1.table1`のみの権限を持っている場合、`information_schema.tables`Tableをクエリすると、`db1.table1`に関連する情報のみが返されます。

### mysql

`mysql`データベース配下のすべてのTableは仮想Tableであり、物理的な実体を持ちません。これらのシステムTableには権限などの情報が含まれており、主にMySQLエコシステムとの互換性のために使用されます。

各Catalog配下に`mysql`データベースがありますが、Tableの内容は同一です。

`mysql`データベース内のすべてのTableは読み取り専用であり、ユーザーはこのデータベース内のTableを変更、削除、作成することはできません。

### __internal_schema

`__internal_schema`データベース配下のすべてのTableは、Doris内の実際のTableであり、ユーザーが作成したデータTableと同様に保存されます。Dorisクラスターが作成されると、このデータベース配下のすべてのシステムTableが自動的に作成されます。

デフォルトでは、一般ユーザーはこのデータベース内のTableに対して読み取り専用権限を持っています。ただし、権限が付与されると、このデータベース配下のTableを変更、削除、作成することができます。
