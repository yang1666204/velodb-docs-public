---
{
  "title": "データ整合性 FAQ",
  "description": "このドキュメントは主にDorisの使用中に遭遇する一般的なデータ整合性の問題を記録するために使用されます。定期的に更新されます。",
  "language": "ja"
}
---
# Data Integrity Issues

この文書は主にDorisの使用中に遭遇する一般的なデータ整合性の問題を記録するために使用されます。定期的に更新されます。

「テーブル内の重複キーデータ」という用語は、merge-on-write Uniqueテーブルにおいて重複キーデータが現れることを指します。merge-on-write Uniqueテーブルでの重複キーの問題は[full compactionをトリガー](../admin-manual/trouble-shooting/repairing-data)することで修正できますが、他のタイプの整合性の問題については状況に基づいた特定の解決策が必要な場合があります。サポートが必要な場合は、コミュニティサポートにお問い合わせください。

| 問題の説明 | 発生条件 | 影響を受けるバージョン | 修正バージョン | 影響範囲 | Fix PR |
|---|---|---|---|---|---|
| merge-on-write Uniqueテーブルでのインポート中の部分列更新により、以前に削除されたデータが再度導入される | 部分列更新時に`__DORIS_DELETE_SIGN__`列が指定され、履歴データに`__DORIS_DELETE_SIGN__`列によって削除済みとマークされた行が含まれている | <2.1.8 | >=2.1.8 | Partial Column Update | [#46194](https://github.com/apache/doris/pull/46194) |
| auto-increment列のシステム生成値が0または重複している | BEとFE間のネットワーク異常 | <2.1.8 | >=2.1.8 | Auto-increment column | [#43774](https://github.com/apache/doris/pull/43774) |
| Stream Loadインポートがmerge-on-write Uniqueテーブルで`delete`条件を満たすデータを削除しない | `merge_type: MERGE`、`partial_columns: true`、`delete`パラメータを使用したStream Loadインポート | <2.0.15, <2.17 | >=2.0.15, >=2.17 | Partial Column Update | [#40730](https://github.com/apache/doris/pull/40730) |
| 部分列更新インポートによりauto-increment列の値が意図しない更新を受ける | テーブルがValue列にauto-increment列を持ち、部分列更新インポートでそれらのauto-increment列の値を指定していない | <2.1.6 | >=2.1.6 | Auto-increment column | [#39996](https://github.com/apache/doris/pull/39996) |
| テーブル内の重複キーデータ | ユーザーが`ALTER TABLE tbl ENABLE FEATURE "SEQUENCE_LOAD" WITH ...`を使用してsequence列をサポートしないmerge-on-write Uniqueテーブルにsequence列機能を追加し、その後新しいインポートを実行 | <2.0.15, <2.1.6 | >=2.0.15, >=2.1.6 |  | [#39958](https://github.com/apache/doris/pull/39958) |
| 部分列更新インポートによりmerge-on-write Uniqueテーブルでデータ破損が発生 | merge-on-write Uniqueテーブルでの同時部分列更新で、インポートプロセス中にBEが再起動 | <2.0.15, <2.1.6 | >=2.0.15, >=2.1.6 | Partial Column Update | [#38331](https://github.com/apache/doris/pull/38331) |
| テーブル内の重複キーデータ | sequence列を持つmerge-on-write Uniqueテーブルでの大規模単一インポートがsegment compactionをトリガー | <2.0.15, <2.1.6 | >=2.0.15, >=2.1.6 |  | [#38369](https://github.com/apache/doris/pull/38369) |
| テーブル内の重複キーデータ | merge-on-write Uniqueテーブルでのfull cloneの失敗 | <2.0.13, <2.1.5 | >=2.0.13, >=2.1.5 || [#37001](https://github.com/apache/doris/pull/37001) |
| merge-on-write Uniqueテーブルでの不整合マルチレプリカデータ | merge-on-write Uniqueテーブルでの`__DORIS_DELETE_SIGN__`列を使用した部分列更新インポートで、インポート中にレプリカ間でBase Compactionの進行状況が不整合 | <2.0.15, <2.1.5 | >=2.0.15, >=2.1.5 | Partial Column Update | [#36210](https://github.com/apache/doris/pull/36210) |
| テーブル内の重複キーデータ | merge-on-write Uniqueテーブルでの同時部分列更新とインポート中のBE再起動 | <2.0.11, <2.1.4 | >=2.0.11, >=2.1.4 | Partial Column Update | [#35739](https://github.com/apache/doris/pull/35739) |
