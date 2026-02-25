---
{
  "title": "DML チューニングプラン",
  "description": "DML計画のチューニングにおいて、まずパフォーマンスのボトルネックがimportプロセスによるものか、クエリセクションによるものかを特定する必要があります。",
  "language": "ja"
}
---
DML planのチューニングについては、まずパフォーマンスボトルネックがimportプロセスによるものかqueryセクションによるものかを特定する必要があります。queryセクションでのパフォーマンスボトルネックのトラブルシューティングおよびチューニングについては、詳細は[Plan Tuning](optimizing-table-schema.md)の他のサブセクションを参照してください。

Dorisは複数のデータソースからのデータimportをサポートしています。Dorisが提供する様々なimport機能を柔軟に活用することで、様々なソースのデータを効率的にDorisにimportして分析することができます。ベストプラクティスの詳細については、[Import Overview](../../../data-operate/import/load-manual.md)を参照してください。
