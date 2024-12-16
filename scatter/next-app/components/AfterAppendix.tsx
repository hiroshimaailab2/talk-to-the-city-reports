const AfterAppendix = () => {
  return (
    <div className="text-left mt-8">
      <a href="https://www.seisakukikaku.metro.tokyo.lg.jp/basic-plan/choki-plan/ikenbosyu">
        <img
          src="/img/NewTokyo2050_banner.png"
          alt="「シン東京20250」プロジェクトご意見大募集中！応募詳細はこちら"
          style={{ width: "100%", maxWidth: "660px" }}
        />
      </a>
      <br />
      <a
        href={`https://x.com/intent/post?hashtags=%E3%82%B7%E3%83%B3%E6%9D%B1%E4%BA%AC2050`}
        className="text-blue-500 hover:underline"
      >
        「#シン東京2050」をつけてXで投稿
      </a>
      <br />
      <div>募集期間：令和6年12月20日まで</div>
      <br />
      <a
        href={`https://www.seisakukikaku.metro.tokyo.lg.jp/policy`}
        className="text-blue-500 hover:underline"
      >
        サイトポリシー
      </a>
      <br />
      <a
        href={`https://www.seisakukikaku.metro.tokyo.lg.jp/policy/privacy`}
        className="text-blue-500 hover:underline"
      >
        個人情報保護方針
      </a>
      <br />
    </div>
  );
};

export default AfterAppendix;
