---
{
  "title": "タイムゾーン",
  "description": "Dorisはカスタムタイムゾーン設定をサポートしています",
  "language": "ja"
}
---
Dorisはカスタムタイムゾーン設定をサポートしています

## 基本概念

Doris内には、以下の2つのタイムゾーン関連パラメータが存在します：

- `system_time_zone`：サーバーの起動時に、マシンによって設定されたタイムゾーンに従って自動的に設定され、設定後は変更できません。
- `time_zone`：クラスターの現在のタイムゾーン。この変数はクラスター開始時に`system_time_zone`と同じ値に設定され、ユーザーが手動で変更しない限り再度変更されることはありません。

## 具体的な操作

1. `SHOW VARIABLES LIKE '% time_zone%'`

    現在のタイムゾーン関連設定を確認します

2. `SET [global] time_zone = 'Asia/Shanghai';`

   このコマンドはセッションレベルでタイムゾーンを設定します。`global`キーワードが使用された場合、Doris FEはパラメータを永続化し、その後のすべての新しいセッションに対して有効になります。

## データソース

タイムゾーンデータには、タイムゾーンの名前、対応する時刻オフセット、夏時間の変更が含まれます。BEが配置されているマシンでは、データのソースはコマンド`TZDIR`によって返されるディレクトリです。サポートされていない場合は、ディレクトリ`/usr/share/zoneinfo`が使用されます。

## タイムゾーンの影響

### 1. 関数

`NOW()`や`CURTIME()`などの時間関数で表示される値、また`show load`、`show backends`の時刻値が含まれます。

ただし、`create table`での時刻型パーティション列のless than値には影響せず、`date/datetime`型として格納された値の表示にも影響しません。

タイムゾーンに影響される関数：

- `FROM_UNIXTIME`：UTCタイムスタンプが与えられた場合、Dorisセッション`time_zone`で指定されたタイムゾーンでの日付と時刻を返します。例えば、`time_zone`が`CST`の場合、`FROM_UNIXTIME(0)`は`1970-01-01 08:00:00`を返します。

- `UNIX_TIMESTAMP`：日付と時刻が与えられた場合、Dorisセッション`time_zone`で指定されたタイムゾーンでのUTCタイムスタンプを返します。例えば、`time_zone`が`CST`の場合、`UNIX_TIMESTAMP('1970-01-01 08:00:00')`は`0`を返します。

- `CURTIME`：現在のDorisセッション`time_zone`で指定されたタイムゾーンの時刻を返します。

- `NOW`：現在のDorisセッション`time_zone`で指定されたタイムゾーンの日付と時刻を返します。

- `CONVERT_TZ`：指定されたタイムゾーンから別のタイムゾーンにdatetimeを変換します。

### 2. 時刻型の値

`DATE`および`DATETIME`型について、データインポート時のタイムゾーン変換をサポートしています。

- データにタイムゾーンがある場合、例えば現在のDoris `time_zone = +00:00`で「2020-12-12 12:12:12+08:00」のような場合、データはDorisにインポートされ、実際の値は「2020-12-12 04:12:12」になります。

- データにタイムゾーンが含まれていない場合、例えば「2020-12-12 12:12:12」のような場合、時刻は絶対時刻と見なされ、変換は行われません。

### 3. 夏時間

夏時間は本質的に名前付きタイムゾーンの実際の時刻オフセットであり、特定の日付に変更されます。

例えば、`America/Los_Angeles`タイムゾーンには、毎年おおよそ3月と11月に開始および終了する夏時間調整が含まれています。つまり、`America/Los_Angeles`の実際のタイムゾーンオフセットは、3月の夏時間開始時に`-08:00`から`-07:00`に変更され、11月の夏時間終了時に`-07:00`から`-08:00`に変更されます。
夏時間を有効にしたくない場合は、`America/Los_Angeles`の代わりに`time_zone`を`-08:00`に設定してください。

## 使用方法

タイムゾーン値は様々な形式で指定できます。以下の標準形式がDorisでよくサポートされています：

1. 標準の名前付きタイムゾーン形式、例えば「Asia/Shanghai」、「America/Los_Angeles」。この形式は[このマシンのタイムゾーンデータ](#data-source)に由来します。「Etc/GMT+3」なども、このカテゴリに属します。

2. 標準のオフセット形式、例えば「+02:30」、「-10:00」（「+12:03」などの特殊なオフセットはサポートされていません）

3. 略語タイムゾーン形式、現在以下のみサポート：

   1. 「GMT」、「UTC」、「+00:00」タイムゾーンと同等

   2. 「CST」、「Asia/Shanghai」タイムゾーンと同等

4. Zuluタイムゾーンの単一文字Z、「+00:00」タイムゾーンと同等

また、アルファベットの解析はすべて大文字小文字を区別しません。

注意：実装の違いにより、Dorisの一部のインポートでは現在他の形式がサポートされています。**本番環境では、ここに記載されていないこれらの形式に依存すべきではありません。これらの動作はいつでも変更される可能性があります**。そのため、バージョン更新の関連するchangelogに注意を払ってください。

## ベストプラクティス

### タイムゾーンに依存するデータ

タイムゾーンの問題には、主に3つの影響があります：

1. セッション変数`time_zone` -- クラスタータイムゾーン

2. インポート時に指定されるheader `timezone`（Stream Load、Broker Loadなど）-- インポートタイムゾーン

3. 「2023-12-12 08:00:00+08:00」における「+08:00」のようなタイムゾーン型リテラル -- データタイムゾーン

以下のように理解できます：

Dorisは現在、様々なタイムゾーンのデータをDorisにインポートすることと互換性があります。Doris自体の`DATETIME`や他の時刻型にはタイムゾーン情報が含まれておらず、インポート後はタイムゾーンの変更でデータが変わることはないため、時刻データがDorisにインポートされる際は、以下の2つのカテゴリに分けることができます：

1. 絶対時刻

   絶対時刻とは、関連するデータシーンがタイムゾーンと関係がないことを意味します。この種のデータは、タイムゾーン接尾辞なしでインポートされ、そのまま保存される必要があります。

2. 特定のタイムゾーンでの時刻

   特定のタイムゾーンでの時刻とは、関連するデータシーンがタイムゾーンに関連することを意味します。この種のデータは、特定のタイムゾーン接尾辞付きでインポートされる必要があります。インポート時には、Dorisクラスター`time_zone`タイムゾーンまたはStream Load/Broker Loadで指定されたheader `timezone`に変換されます。

   この種のデータは、インポート後にインポート時に指定されたタイムゾーンでの絶対時刻ストレージに変換されるため、後続のインポートとクエリは、データの意味の混乱を避けるためにこのタイムゾーンを維持する必要があります。

 * Insert文については、以下の例で説明できます：

    ```sql
    Doris > select @@time_zone;
    +---------------+
    | @@time_zone   |
    +---------------+
    | Asia/Shanghai |
    +---------------+
    
    Doris > insert into dt values('2020-12-12 12:12:12+02:00'); --- The imported data specifies a time zone of +02:00
    
    Doris > select * from dt;
    +---------------------+
    | dt                  |
    +---------------------+
    | 2020-12-12 18:12:12 | --- Is converted to the Doris cluster time zone Asia/Shanghai, subsequent imports and queries should maintain this time zone.
    +---------------------+
    
    Doris > set time_zone = 'America/Los_Angeles';
    
    Doris > select * from dt;
    +---------------------+
    | dt                  |
    +---------------------+
    | 2020-12-12 18:12:12 | --- If time_zone is modified, the time value will not change accordingly, and its meaning during query will be confused.
    +---------------------+
    ```
* Stream LoadやBroker Loadなどのインポートメソッドでは、ヘッダー`timezone`を指定することでこれを実現できます。例えば、Stream Loadの場合、以下の例で説明できます：

    ```shell
    cat dt.csv
    2020-12-12 12:12:12+02:00
    
    curl --location-trusted -u root: \
     -H "Expect:100-continue" \
     -H "strict_mode: true" \
     -H "timezone: Asia/Shanghai" \
     -T dt.csv -XPUT \
     http://127.0.0.1:8030/api/test/dt/_stream_load
    ```
    ```sql
    Doris > select @@time_zone;
    +---------------+
    | @@time_zone   |
    +---------------+
    | Asia/Shanghai |
    +---------------+
    
    Doris > select * from dt;
    +---------------------+
    | dt                  |
    +---------------------+
    | 2020-12-12 18:12:12 | --- Is converted to the Doris cluster time zone Asia/Shanghai, subsequent imports and queries should maintain this time zone.
    +---------------------+
    ```
:::tip
    * Stream LoadやBroker Loadなどのインポート方法では、ヘッダー`timezone`がDorisクラスターの`time_zone`を上書きするため、インポート時に一貫性を保つ必要があります。
    * Stream LoadやBroker Loadなどのインポート方法では、ヘッダー`timezone`がインポート変換で使用される関数に影響を与えます。
    * インポート時にヘッダー`timezone`が指定されていない場合、デフォルトで東8区が使用されます。
   :::

**まとめると、タイムゾーンの問題を扱うためのベストプラクティスは以下の通りです:**

:::info Best Practices
1. クラスターが表すタイムゾーンを確認し、使用前に`time_zone`を設定し、その後は変更しないでください。

2. インポート時にヘッダー`timezone`をクラスターの`time_zone`と一致するように設定してください。

3. 絶対時刻の場合は、タイムゾーンサフィックスなしでインポートし、タイムゾーン付きの時刻の場合は、特定のタイムゾーンサフィックス付きでインポートすると、インポート後にDorisの`time_zone`タイムゾーンに変換されます。
:::

### 夏時間

夏時間の開始時刻と終了時刻は[現在のタイムゾーンデータソース](#data-source)から取得され、必ずしも当年のタイムゾーン地域の実際の公式認定時刻と正確に対応するとは限りません。このデータはICANNによって保守されています。夏時間が当年の指定通りに動作することを確実にする必要がある場合は、Dorisが選択したデータソースが最新のICANN公開タイムゾーンデータであることを確認してください。ダウンロードアクセスについては以下を参照してください。

### 情報更新

実世界のタイムゾーンと夏時間データは、様々な理由により時々変更される可能性があり、IANAは定期的にこれらの変更を記録し、対応するタイムゾーンファイルを更新します。Dorisのタイムゾーン情報を最新のIANAデータと同期させたい場合は、以下のいずれかを実行してください:

1. Package Managerを使用して更新する

現在のオペレーティングシステムで使用されているパッケージマネージャーに応じて、対応するコマンドを使用してタイムゾーンデータを直接更新できます:

```shell
# yum
> sudo yum update tzdata
# apt
> sudo apt update tzdata
```
この方法で更新されたデータは、システムの `$TZDIR`（通常は `usr/share/zoneinfo`）配下に配置されます。

2. IANA time zone databaseを手動でpullする（推奨）

ほとんどのLinuxディストリビューションでは、tzdataが適時に同期されないpackage managerを使用しています。time zoneデータの精度が重要な場合は、IANAが公開しているデータを定期的にpullすることができます：

```shell
wget https://www.iana.org/time-zones/repository/tzdb-latest.tar.lz
```
次に、展開されたフォルダ内のREADMEファイルに従って、特定のzoneinfoデータを生成します。生成されたデータは`$TZDIR`フォルダを上書きするためにコピーする必要があります。

上記のすべての操作は、BEマシン上で完了した後、対応するBEで**必ず**再起動して有効にする必要があることに注意してください。

## 拡張資料

- [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

- [IANA Time Zone Database](https://www.iana.org/time-zones)

- [The tz-announce Archives](https://mm.icann.org/pipermail/tz-announce/)
