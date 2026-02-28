---
{
  "title": "Manager のアップグレード",
  "description": "Manager バージョン 24.0.0 以降の エージェント モードは、バージョン 23.X の SSH モードと互換性がありません。23.X から 24 にアップグレードする必要がある場合",
  "language": "ja"
}
---
# Manager のアップグレード

Manager バージョン 24.0.0 以降の エージェント モードは、バージョン 23.X の SSH モードと互換性がありません。23.X から 24.X 以降にアップグレードする必要がある場合は、まずバージョン 23.X をアンインストールしてから、バージョン 24.X を再デプロイする必要があります。以下では、バージョン 24.X のアップグレード方法について説明します。

## ステップ 1: 現在のバージョンを確認する

1.  **Manager WebServer バージョンを確認する**

    左下のユーザー情報をクリックして、現在の Manager バージョンを確認します。

    ![check-manager-version](/images/enterprise/doris-manager-guide/doris-manager-management/upgrade-doris-manager/check-manager-version.png)

2.  **エージェント バージョンを確認する**

    アップグレード前後で、WebServer バージョンと エージェント バージョンが同じであることを確認してください。エージェント バージョンはホストページで確認できます：

    ![check-agent-version](/images/enterprise/doris-manager-guide/doris-manager-management/upgrade-doris-manager/check-agent-version.png)

## ステップ 2: Manager インストールパッケージの新バージョンをダウンロードする

アップグレードページで、Manager サーバー上のターゲットバージョンインストールパッケージの保存パスの入力を求められます。アップグレードボタンをクリックします。

:::tip

注意：

アップグレード中は、WebServer のみアップグレードする必要があります。エージェント バージョンは各ハートビートサイクル中にチェックされ、WebServer バージョンと一致しない場合は自動的にアップグレードされます。アップグレード後、エージェント デプロイメントディレクトリに `upgrade` ディレクトリが表示され、アップグレード前の情報がバックアップされます。

:::

![chose-upgrade-version](/images/enterprise/doris-manager-guide/doris-manager-management/upgrade-doris-manager/chose-upgrade-version.png)
