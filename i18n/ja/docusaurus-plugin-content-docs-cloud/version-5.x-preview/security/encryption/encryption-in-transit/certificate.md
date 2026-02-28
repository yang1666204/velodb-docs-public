---
{
  "title": "MySQL クライアント証明書",
  "description": "DorisでSSL機能を有効にするには、CAキー証明書とサーバーサイドキー証明書の両方を設定する必要があります。",
  "language": "ja"
}
---
# MySQL クライアント Certificate

DorisでSSL機能を有効にするには、CAキー証明書とサーバーサイドキー証明書の両方を設定する必要があります。相互認証を有効にするには、クライアントサイドキー証明書も生成する必要があります：

* デフォルトのCAキー証明書ファイルは`Doris/fe/mysql_ssl_default_certificate/ca_certificate.p12`に配置されており、デフォルトパスワードは`doris`です。FE設定ファイル`conf/fe.conf`を変更して`mysql_ssl_default_ca_certificate = /path/to/your/certificate`を追加することで、CAキー証明書ファイルを変更できます。また、`mysql_ssl_default_ca_certificate_password = your_password`を追加して、カスタムキー証明書ファイルのパスワードを指定することもできます。

* デフォルトのサーバーサイドキー証明書ファイルは`Doris/fe/mysql_ssl_default_certificate/server_certificate.p12`に配置されており、デフォルトパスワードは`doris`です。FE設定ファイル`conf/fe.conf`を変更して`mysql_ssl_default_server_certificate = /path/to/your/certificate`を追加することで、サーバーサイドキー証明書ファイルを変更できます。また、`mysql_ssl_default_server_certificate_password = your_password`を追加して、カスタムキー証明書ファイルのパスワードを指定することもできます。

* デフォルトでは、クライアントサイドキー証明書も生成され、`Doris/fe/mysql_ssl_default_certificate/client-key.pem`と`Doris/fe/mysql_ssl_default_certificate/client_certificate/`に格納されます。

## カスタムキー証明書ファイル

Dorisのデフォルト証明書ファイルに加えて、`openssl`を使用してカスタム証明書ファイルを生成することもできます。手順は以下の通りです（[Creating SSL Certificates and Keys Using OpenSSL](https://dev.mysql.com/doc/refman/8.0/en/creating-ssl-files-using-openssl.html)を参照）：

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
2. 作成された証明書を検証する：

```shell
openssl verify -CAfile ca.pem server-cert.pem client-cert.pem
```
3. キーと証明書をPKCS#12 (P12) バンドルに結合します。証明書フォーマットを指定することも可能です（デフォルトはPKCS12）。conf/fe.conf設定ファイルを変更し、パラメータssl_trust_store_typeを追加して証明書フォーマットを指定できます。

```shell
# Package the CA key and certificate
openssl pkcs12 -inkey ca-key.pem -in ca.pem -export -out ca_certificate.p12

# Package the server-side key and certificate
openssl pkcs12 -inkey server-key.pem -in server-cert.pem -export -out server_certificate.p12
```
:::info 注記
[参考資料](https://www.ibm.com/docs/en/api-connect/2018.x?topic=overview-generating-self-signed-certificate-using-openssl)
:::
