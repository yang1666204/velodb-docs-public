---
{
  "title": "Join の最適化と Colocate Group",
  "description": "colocateグループの定義は効率的なJoinの方法です。",
  "language": "ja"
}
---
colocate groupを定義することは、Joinの効率的な方法です。これにより実行エンジンは、Join操作で通常発生するデータ転送のオーバーヘッドを効果的に回避できます（Colocate Groupの紹介については、[Colocation Join](../../colocation-join.md)を参照してください）。

ただし、一部のユースケースでは、Colocate Groupが正常に確立されていても、実行計画がShuffle JoinまたはBucket Shuffle Joinとして表示される場合があります。この状況は通常、Dorisがデータを整理している時に発生します。例えば、複数のBE間でより均衡の取れたデータ分散を確保するため、BE間でtabletを移行している場合があります。

`SHOW PROC "/colocation_group";`コマンドを使用してColocate Groupのステータスを確認できます。下図に示すように、`IsStable`が`false`の場合、利用できないColocate Groupインスタンスが存在することを示しています。

![Optimizing Join with Colocate Group](/images/use-colocate-group.jpg)
