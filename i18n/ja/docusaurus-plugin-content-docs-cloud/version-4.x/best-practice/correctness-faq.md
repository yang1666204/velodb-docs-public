---
{
  "title": "データ整合性FAQ",
  "description": "この文書は主にDorisの使用中に遭遇する一般的なデータ整合性の問題を記録するために使用されます。定期的に更新される予定です。",
  "language": "ja"
}
---
# データ整合性問題

このドキュメントは主にDorisの使用中に発生する一般的なデータ整合性問題を記録するために使用されます。定期的に更新されます。

| 問題の説明 | 発生条件 | 影響を受けるバージョン | 修正バージョン | 影響範囲 | 修正PR |
|---|---|---|---|---|---|
| merge-on-write Uniqueテーブルでの部分カラム更新により、以前に削除されたデータが再導入される | 部分カラム更新時に`__DORIS_DELETE_SIGN__`カラムが指定され、履歴データに`__DORIS_DELETE_SIGN__`カラムによって削除済みとしてマークされた行が含まれている | <2.1.8, <3.0.4 | >=2.1.8, >=3.0.4 | Compute-storage結合モード、compute-storage分離モード、部分カラム更新 | [#46194](https://github.com/apache/doris/pull/46194) |
| テーブル内の重複キーデータ | Compute-storage分離モードのmerge-on-write Uniqueテーブルでの並行インポート | <3.0.4 | >=3.0.4 | Compute-storage分離モード | [#46039](https://github.com/apache/doris/pull/46039) |
| テーブル内の重複キーデータ | Compute-storage分離モードのmerge-on-write Uniqueテーブルにおける、インポート間およびインポートとcompaction間の並行インポート | <3.0.4 | >=3.0.4 | Compute-storage分離モード | [#44975](https://github.com/apache/doris/pull/44975) |
| 自動増分カラムのシステム生成値が0または重複 | BEとFE間のネットワーク異常 | <2.1.8, <3.0.3 | >=2.1.8, >=3.0.3 | Compute-storage結合モード、compute-storage分離モード、自動増分カラム | [#43774](https://github.com/apache/doris/pull/43774) |
| Stream Loadインポートがmerge-on-write Uniqueテーブルで`delete`条件を満たすデータを削除しない | `merge_type: MERGE`、`partial_columns: true`、および`delete`パラメータを使用したStream Loadインポート | <2.0.15, <2.17, <3.0.3 | >=2.0.15, >=2.17, >=3.0.3 | Compute-storage結合モード、compute-storage分離モード、部分カラム更新 | [#40730](https://github.com/apache/doris/pull/40730) |
| 部分カラム更新により自動増分カラム値の意図しない更新が発生 | テーブルのValueカラムに自動増分カラムがあり、部分カラム更新インポートでそれらの自動増分カラムの値が指定されていない | <2.1.6, <3.0.2 | >=2.1.6, >=3.0.2 | Compute-storage結合モード、compute-storage分離モード、自動増分カラム | [#39996](https://github.com/apache/doris/pull/39996) |
| テーブル内の重複キーデータ | ユーザーが`ALTER TABLE tbl ENABLE FEATURE "SEQUENCE_LOAD" WITH ...`を使用してsequenceカラムをサポートしていないmerge-on-write UniqueテーブルにsequenceカラムFUNCTIONを追加し、その後新しいインポートを実行 | <2.0.15, <2.1.6, <3.0.2 | >=2.0.15, >=2.1.6, >=3.0.2 | Compute-storage結合モード、compute-storage分離モード | [#39958](https://github.com/apache/doris/pull/39958) |
| テーブル内の重複キーデータ | Compute-storage分離モードのmerge-on-write Uniqueテーブルでの並行インポートまたは並行インポートとcompaction | <3.0.1 | >=3.0.1 | Compute-storage分離モード | [#39018](https://github.com/apache/doris/pull/39018) |
| 部分カラム更新インポートによりmerge-on-write Uniqueテーブルでデータ破損が発生 | merge-on-write Uniqueテーブルでの並行部分カラム更新で、インポートプロセス中にBE再起動が発生 | <2.0.15, <2.1.6, <3.0.2 | >=2.0.15, >=2.1.6, >=3.0.2 | Compute-storage結合モード、compute-storage分離モード、部分カラム更新 | [#38331](https://github.com/apache/doris/pull/38331) |
| テーブル内の重複キーデータ | Compute-storage分離モードのmerge-on-write Uniqueテーブルでの並行インポートとcompaction | <3.0.2 | >=3.0.2 | Compute-storage分離モード | [#37670](https://github.com/apache/doris/pull/37670), [#41309](https://github.com/apache/doris/pull/41309), [#39791](https://github.com/apache/doris/pull/39791) |
| テーブル内の重複キーデータ | sequenceカラムを持つmerge-on-write Uniqueテーブルでの大規模な単一インポートがsegment compactionをトリガー | <2.0.15, <2.1.6, <3.0.2 | >=2.0.15, >=2.1.6, >=3.0.2 | Compute-storage結合モード、compute-storage分離モード | [#38369](https://github.com/apache/doris/pull/38369) |
| テーブル内の重複キーデータ | Compute-storage結合モードのmerge-on-write Uniqueテーブルでのfull clone失敗 | <2.0.13, <2.1.5, <3.0.0 | >=2.0.13, >=2.1.5, >=3.0.0 | Compute-storage結合モード | [#37001](https://github.com/apache/doris/pull/37001) |
| テーブル内の重複キーデータ | Compute-storage分離モードのmerge-on-write Uniqueテーブルでの内部リトライプロセスを含むStream Loadインポート | <3.0.0 | >=3.0.0 | Compute-storage分離モード | [#36670](https://github.com/apache/doris/pull/36670) |
| merge-on-write Uniqueテーブルでのマルチレプリカデータの不整合 | merge-on-write Uniqueテーブルでの`__DORIS_DELETE_SIGN__`カラムを含む部分カラム更新インポートで、インポート中にレプリカ間でBase Compactionの進行状況が不整合 | <2.0.15, <2.1.5, <3.0.0 | >=2.0.15, >=2.1.5, >=3.0.0 | Compute-storage結合モード、compute-storage分離モード、部分カラム更新 | [#36210](https://github.com/apache/doris/pull/36210) |
| テーブル内の重複キーデータ | merge-on-write Uniqueテーブルでの並行部分カラム更新とインポート中のBE再起動 | <2.0.11, <2.1.4, <3.0.0 | >=2.0.11, >=2.1.4, >=3.0.0 | Compute-storage結合モード、compute-storage分離モード、部分カラム更新 | [#35739](https://github.com/apache/doris/pull/35739) |
