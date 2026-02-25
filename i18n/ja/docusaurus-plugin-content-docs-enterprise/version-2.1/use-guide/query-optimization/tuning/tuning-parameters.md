---
{
  "title": "一般的なチューニングパラメータ",
  "description": "データベースチューニングの重要なパラメータであるenable_nereids_planner、parallel_pipeline_task_num、runtime_filter_modeについて学び、クエリパフォーマンスの最適化、バージョンアップグレード、およびSQL実行における適応的並列処理を実現します。",
  "language": "ja"
}
---
| Parameter                  | Description                                         | Default Value | Usage Scenario                                               |
| -------------------------- | --------------------------------------------------- | ------------- | ------------------------------------------------------------ |
| enable_nereids_planner     | 新しいオプティマイザーを有効にするかどうか                 | TRUE          | 低バージョンからのアップグレードなどのシナリオでは、最初にfalseに設定し、アップグレード後にtrueに設定することができます |
| enable_nereids_dml         | 新しいオプティマイザーのDMLサポートを有効にするかどうか | TRUE          | 低バージョンからのアップグレードなどのシナリオでは、最初にfalseに設定し、アップグレード後にtrueに設定することができます |
| parallel_pipeline_task_num | Pipelineの並列性                                | 0             | 低バージョンからのアップグレードなどのシナリオでは、この値は以前固定値に設定されていましたが、アップグレード後は0に設定することができ、これはシステムの適応戦略が並列性を決定することを示します |
| runtime_filter_mode        | Runtime Filterタイプ                                 | GLOBAL        | 低バージョンからのアップグレードなどのシナリオでは、この値はNONEでRuntime Filterが有効でないことを示していましたが、アップグレード後はGLOBALに設定することができ、これはRuntime Filterがデフォルトで有効であることを示します |
