# Physics-based desert scene with dunes, footprints, drifting sand

**#711 by popularity** · ♥ 75 · 12,982 views · by [@KanaWorks_AI](https://x.com/KanaWorks_AI) · [Original post](https://x.com/KanaWorks_AI/status/2118289681578348547) · [Watch the video](https://video.twimg.com/amplify_video/2118289347942416384/vid/avc1/1920x1080/kL-DnXZZZf1PkZAP.mp4)

[![Physics-based desert scene with dunes, footprints, drifting sand](https://pbs.twimg.com/amplify_video_thumb/2118289347942416384/img/jl55crRoo0g-Gfpr.jpg)](https://x.com/KanaWorks_AI/status/2118289681578348547)

## Prompt

```text
Godot 4（Forward+）で、物理で動くリアルな砂漠を作って。計算はGPUのcompute shaderで。
地形は「高さの格子」を3段重ね
・遠景：約1km四方を0.5m格子
・中景：約33m四方を1.6cm格子
・足元：キャラクターに追従する約4m四方を2mm格子
・細かい層の内側では粗い層を描かない（継ぎ目のちらつき防止）

砂丘は描かずに、風で育てる（Werner型モデル）
・512m周期の領域を0.5m格子で、3000ステップ
・毎ステップ：風上の高い所から10〜15°の「風の影」に入っていないマスから砂を少し持ち上げ、約4m風下に落とす
・影の中には必ず積もる。砂の上は積もりやすく、むき出しの地面は積もりにくい
・33°より急な斜面は崩す
・最後に稜線を少し丸め、滑落面を31〜33°に。結果はキャッシュ
足跡と崩れ
・靴底の形で高さを押し下げ、押しのけた分を縁に盛る（体積保存）
・毎フレーム、急すぎる分だけ8近傍へ砂を流す。止まった砂は34°、流れ出したら28°まで崩れる
・湿った砂は崩れにくくする

舞い上がる砂
・削った体積とまったく同じ量を粒子にして飛ばし、着地したら整数アトミックで高さに足し戻す（砂の総量は不変）
・重力＋空気抵抗＋風
・粉塵は3層（濃い芯／外側／長く漂う層）、自己影と地形の影つき
見た目（自作シェーダ）
・法線＝高さ＋波長と向きの違う風紋2つをノイズで混ぜる＋ピクセルサイズの粒の凹凸
・拡散はd'EonのLambert-sphere＋Hapke
・影には空の青い光と、周りの日向からの暖かい照り返し
・きらめき：ワールドに固定した1px未満の点を、太陽と視線のハーフベクトルが風紋の法線に近い所だけ光らせる（太陽側に光の帯ができる）
・セルフシャドウは高さ場のレイマーチ
光とカメラ
・低い太陽（13〜16°）を風下側に置き、稜線で光と影を分ける
・空気遠近の霧を数層
・動画は120fpsで書き出し、4フレームを線形光で平均して30fps（自然なモーションブラー）
```

The prompt and video belong to @KanaWorks_AI; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
