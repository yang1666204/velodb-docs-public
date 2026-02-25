---
{
  "title": "他のOLAPからのデータ移行",
  "description": "他のOLAPシステムからDorisにデータを移行する場合、いくつかのオプションがあります：",
  "language": "ja"
}
---
他のOLAPシステムからDorisにデータを移行するには、いくつかのオプションがあります：

- Hive/Iceberg/Hudiなどのシステムについては、Multi-Catalogを使用してそれらを外部テーブルとしてマップし、「Insert Into」を使用してデータをロードできます

- OLAPシステムからCSVなどの形式にデータをエクスポートし、これらのデータファイルをDorisにロードできます

- Spark/Flinkなどのシステムを使用し、OLAPシステムのConnectorを活用してデータを読み取り、DorisのConnectorを呼び出してDorisに書き込むことができます

:::info NOTE
このリストに追加できる他の移行ツールをご存知の場合は、dev@doris.apache.orgまでお問い合わせください
:::
