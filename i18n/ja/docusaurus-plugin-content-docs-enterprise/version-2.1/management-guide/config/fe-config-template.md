---
{
  "title": "FE 構成",
  "language": "ja"
}
---
<!-- Please sort the configuration alphabetically -->

# FE 構成

このドキュメントでは、主にFEの関連する設定項目について紹介します。

FE設定ファイル`fe.conf`は通常、FEデプロイメントパスの`conf/`ディレクトリに格納されます。バージョン0.14では、別の設定ファイル`fe_custom.conf`が導入されます。この設定ファイルは、ユーザーが動作中に動的に設定し、永続化した設定項目を記録するために使用されます。

FEプロセスが開始された後、まず`fe.conf`の設定項目を読み取り、次に`fe_custom.conf`の設定項目を読み取ります。`fe_custom.conf`の設定項目は、`fe.conf`の同じ設定項目を上書きします。

`fe_custom.conf`ファイルの場所は、`custom_config_dir`設定項目を通じて`fe.conf`で設定できます。

## 注意事項

**1.** アーキテクチャ簡素化の目的で、mysqlプロトコルを通じた設定の変更は、ローカルFEメモリ内のデータのみを変更し、すべてのFEに変更を同期しません。
Master FEでのみ有効になるConfig項目については、変更リクエストは自動的にMaster FEに転送されます。

**2.** オプション```forward_to_master```は```show frontend config```の表示結果に影響することに注意してください。```forward_to_master=true```の場合、```show frontend config```はMaster FEのConfigを表示します（現在Follower FEに接続していても）。これにより、ローカルFE設定の変更を確認できない可能性があります。接続しているFEの設定を表示したい場合は、コマンド```set forward_to_master=false```を実行してください。

## 設定項目の確認

FEの設定項目を確認する方法は2つあります：

1. FE Webページ

    ブラウザでFE Webページ`http://fe_host:fe_http_port/Configure`を開きます。`Configure Info`で現在有効なFE設定項目を確認できます。

2. コマンドによる確認

    FEが開始された後、MySQLクライアントで以下のコマンドを使用してFEの設定項目を確認できます：

    `SHOW FRONTEND CONFIG;`

    結果の列の意味は以下の通りです：

    * Key: 設定項目の名前。
    * Value: 現在の設定項目の値。
    * タイプ: 設定項目値のタイプ（integerやstringなど）。
    * IsMutable: 動的に設定可能かどうか。trueの場合、設定項目は実行時に動的に設定できます。falseの場合、設定項目は`fe.conf`でのみ設定でき、FEを再起動した後に有効になります。
    * MasterOnly: Master FEノード固有の設定項目かどうか。trueの場合、設定項目はMaster FEノードでのみ意味があり、他のタイプのFEノードでは意味がありません。falseの場合、設定項目はすべてのタイプのFEノードで意味があります。
    * Comment: 設定項目の説明。

## 設定項目の設定

FE設定項目を設定する方法は2つあります：

1. 静的設定

    `conf/fe.conf`ファイルに設定項目を追加・設定します。`fe.conf`の設定項目は、FEプロセス開始時に読み取られます。`fe.conf`にない設定項目はデフォルト値を使用します。

2. MySQLプロトコルによる動的設定

    FE開始後、以下のコマンドを通じて設定項目を動的に設定できます。このコマンドには管理者権限が必要です。

    `ADMIN SET FRONTEND CONFIG (" fe_config_name "=" fe_config_value ");`

    すべての設定項目が動的設定をサポートしているわけではありません。`SHOW FRONTEND CONFIG;`コマンド結果の`IsMutable`列で動的設定がサポートされているかを確認できます。

    `MasterOnly`の設定項目が変更された場合、コマンドは直接Master FEに転送され、Master FE内の対応する設定項目のみが変更されます。

    **この方法で変更された設定項目は、FEプロセス再起動後に無効になります。**

    このコマンドの詳細なヘルプは、`HELP ADMIN SET CONFIG;`コマンドで確認できます。
    
3. HTTPプロトコルによる動的設定

    詳細については、[Set Config Action](../open-api/fe-http/set-config-action)を参照してください。

    この方法では、変更された設定項目を永続化することもできます。設定項目は`fe_custom.conf`ファイルに永続化され、FE再起動後も有効になります。

## 例

1. `async_pending_load_task_pool_size`の変更

    `SHOW FRONTEND CONFIG;`で、この設定項目は動的に設定できない（`IsMutable`がfalse）ことが確認できます。`fe.conf`に以下を追加する必要があります：

    `async_pending_load_task_pool_size = 20`

    その後、FEプロセスを再起動して設定を有効にします。

2. `dynamic_partition_enable`の変更

    `SHOW FRONTEND CONFIG;`で、この設定項目は動的に設定できる（`IsMutable`がtrue）ことが確認できます。そして、これはMaster FE固有の設定です。まず、任意のFEに接続し、以下のコマンドを実行して設定を変更できます：

    ```
    ADMIN SET FRONTEND CONFIG ("dynamic_partition_enable" = "true"); `
    ```
その後、以下のコマンドで変更された値を確認できます：

    ```
    set forward_to_master = true;
    SHOW FRONTEND CONFIG;
    ```
上記の方法で変更した後、Master FEが再起動されるかMaster選出が実行されると、設定は無効になります。設定項目を`fe.conf`に直接追加してFEを再起動することで、設定項目を永続化できます。

3. `max_distribution_pruner_recursion_depth`の変更

    `SHOW FRONTEND CONFIG;`を通じて、この設定項目が動的に設定可能（`IsMutable`がtrue）であることを確認できます。これはMaster FE固有ではありません。

    同様に、動的な設定変更コマンドによって設定を変更できます。この設定はMaster FE固有ではないため、ユーザーは異なるFEに個別に接続して設定を動的に変更する必要があり、これによりすべてのFEが変更された設定値を使用するようになります。

## 設定

> 注意：
>
> 以下の内容は`docs/generate-config-and-variable-doc.sh`によって自動生成されます。
>
> 変更が必要な場合は、`fe/fe-common/src/main/java/org/apache/doris/common/Config.java`内の説明情報を変更してください。

<--DOC_PLACEHOLDER-->
