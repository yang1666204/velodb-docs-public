---
{
  "title": "MySQL クライアント証明書",
  "language": "ja"
}
---
## 暗号化接続でサーバーと通信する

DorisはSSLベースの暗号化接続をサポートしています。現在、TLS1.2とTLS1.3プロトコルをサポートしています。DorisのSSLモードは以下の設定で有効にできます：
FE設定ファイル`conf/fe.conf`を変更し、`enable_ssl = true`を追加します。

次に、`mysql`クライアントを通じてDorisに接続します。mysqlは3つのSSLモードをサポートしています：

1. `mysql -uroot -P9030 -h127.0.0.1`は`mysql --ssl-mode=PREFERRED -uroot -P9030 -h127.0.0.1`と同じで、どちらも最初にSSL暗号化接続の確立を試行し、失敗した場合は通常の接続を試行します。

2. `mysql --ssl-mode=DISABLE -uroot -P9030 -h127.0.0.1`、SSL暗号化接続を使用せず、通常の接続を直接使用します。

3. `mysql --ssl-mode=REQUIRED -uroot -P9030 -h127.0.0.1`、SSL暗号化接続の使用を強制します。

>注意:
>`--ssl-mode`パラメータはmysql5.7.11バージョンで導入されました。このバージョンより低いmysqlクライアントバージョンについては[こちら](https://dev.mysql.com/doc/connector-j/8.0/en/connector-j-connp-props-security.html)を参照してください。
DorisはSSL暗号化接続を検証するためのキー証明書ファイルが必要です。デフォルトのキー証明書ファイルは`Doris/fe/mysql_ssl_default_certificate/certificate.p12`に配置されており、デフォルトパスワードは`doris`です。FE設定ファイル`conf/fe.conf`を変更し、`mysql_ssl_default_certificate = /path/to/your/certificate`を追加してキー証明書ファイルを変更でき、また`mysql_ssl_default_certificate_password = your_password`を通じてカスタムキー証明書ファイルに対応するパスワードを追加することもできます。

DorisはmTLSもサポートしています：
FE設定ファイル`conf/fe.conf`を変更し、`ssl_force_client_auth=true`を追加します。

その後、`mysql`クライアントを通じてDorisに接続できます：

`mysql -ssl-mode=VERIFY_CA -uroot -P9030 -h127.0.0.1 --tls-version=TLSv1.2 --ssl-ca=/path/to/your/ca --ssl-cert=/path/to/your/cert --ssl-key=/path/to/your/key`

デフォルトのca、cert、keyファイルは`Doris/conf/mysql_ssl_default_certificate/client_certificate/`に配置されており、それぞれ`ca.pem`、`client-cert.pem`、`client-key.pem`という名前です。

opensslまたはkeytoolを使用して独自の証明書ファイルを生成することもできます。

## キー証明書設定

DorisでSSL機能を有効にするには、CAキー証明書とサーバーサイドキー証明書の両方を設定する必要があります。相互認証を有効にするには、クライアントサイドキー証明書も生成する必要があります：

* デフォルトのCAキー証明書ファイルは`Doris/fe/mysql_ssl_default_certificate/ca_certificate.p12`に配置されており、デフォルトパスワードは`doris`です。FE設定ファイル`conf/fe.conf`を変更して`mysql_ssl_default_ca_certificate = /path/to/your/certificate`を追加し、CAキー証明書ファイルを変更できます。また、`mysql_ssl_default_ca_certificate_password = your_password`を追加して、カスタムキー証明書ファイルのパスワードを指定することもできます。

* デフォルトのサーバーサイドキー証明書ファイルは`Doris/fe/mysql_ssl_default_certificate/server_certificate.p12`に配置されており、デフォルトパスワードは`doris`です。FE設定ファイル`conf/fe.conf`を変更して`mysql_ssl_default_server_certificate = /path/to/your/certificate`を追加し、サーバーサイドキー証明書ファイルを変更できます。また、`mysql_ssl_default_server_certificate_password = your_password`を追加して、カスタムキー証明書ファイルのパスワードを指定することもできます。

* デフォルトでは、クライアントサイドキー証明書も生成され、`Doris/fe/mysql_ssl_default_certificate/client-key.pem`と`Doris/fe/mysql_ssl_default_certificate/client_certificate/`に保存されます。

## カスタムキー証明書ファイル

Dorisのデフォルト証明書ファイルに加えて、`openssl`を通じてカスタム証明書ファイルを生成することもできます。以下が手順です（[Creating SSL Certificates and Keys Using OpenSSL](https://dev.mysql.com/doc/refman/8.0/en/creating-ssl-files-using-openssl.html)を参照）：

1. CA、サーバーサイド、クライアントサイドのキーと証明書を生成します：

```shell
# Generate the CA certificate
openssl genrsa 2048 > ca-key.pem
openssl req -new -x509 -nodes -days 3600 \
        -key ca-key.pem -out ca.pem

# Generate the server certificate and sign it with the above CA
# server-cert.pem = public key, server-key.pem = private key
openssl req -newkey rsa:2048 -days 3600 \
        -nodes -keyout server-key.pem -out server-req.pem
openssl rsa -in server-key.pem -out server-key.pem
openssl x509 -req -in server-req.pem -days 3600 \
        -CA ca.pem -CAkey ca-key.pem -set_serial 01 -out server-cert.pem

# Generate the client certificate and sign it with the above CA
# client-cert.pem = public key, client-key.pem = private key
openssl req -newkey rsa:2048 -days 3600 \
        -nodes -keyout client-key.pem -out client-req.pem
openssl rsa -in client-key.pem -out client-key.pem
openssl x509 -req -in client-req.pem -days 3600 \
        -CA ca.pem -CAkey ca-key.pem -set_serial 01 -out client-cert.pem
```
2. 作成された証明書を検証します：

```shell
openssl verify -CAfile ca.pem server-cert.pem client-cert.pem
```
3. キーと証明書をPKCS#12（P12）バンドルに結合します。証明書フォーマットを指定することもできます（デフォルトはPKCS12）。conf/fe.conf設定ファイルを変更し、パラメータssl_trust_store_typeを追加して証明書フォーマットを指定できます。

```shell
# Package the CA key and certificate
openssl pkcs12 -inkey ca-key.pem -in ca.pem -export -out ca_certificate.p12

# Package the server-side key and certificate
openssl pkcs12 -inkey server-key.pem -in server-cert.pem -export -out server_certificate.p12
```
:::info 注意
[参考ドキュメント](https://www.ibm.com/docs/en/api-connect/2018.x?topic=overview-generating-self-signed-certificate-using-openssl)
:::
