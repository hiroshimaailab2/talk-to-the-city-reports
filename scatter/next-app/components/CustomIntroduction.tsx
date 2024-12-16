import showdown from "showdown";
const converter = new showdown.Converter();

const CustomIntroduction = (props: any) => {
  const { override, config } = props;

  if (!override) {
    // 元のコードを使用
    if (config.intro) {
      return (
        <div className="m-auto mb-4 text-justify">
          <div className="mb-6">
            <h3 className="font-bold mt-4">【ブロードリスニングの見方】</h3>
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>全体地図：</strong>
                同じ色のグループは同じ政策分野・事象に関する意見です。全体として、どのような事象に対して意見が発信されているかが分かります。
              </li>
              <li>
                <strong>グループごとの意見の傾向：</strong>
                同じ事象のグループ全体の意見の傾向を、AIが要約して表示します。
              </li>
              <li>
                <strong>個別の意見：</strong>
                それぞれの点にカーソルを合わせると、個別の投稿の内容が確認できます。（＊著作権の関係で、個別の投稿は原文のままではなく、要旨を表示しています）
              </li>
            </ul>
          </div>

          <h3 className="font-bold mt-6">分析に関する概要</h3>
          <div
            className="italic"
            dangerouslySetInnerHTML={{
              __html: converter.makeHtml(config.intro),
            }}
          />
          <div className="mt-6">
            <h3 className="font-bold">動作環境</h3>
            <p>
              本ページを快適にご覧いただくには横幅1200px以上の環境が必要です。スマートフォンをご利用の場合、全画面地図は画面を横向きにしてご利用ください。
            </p>
          </div>
        </div>
      );
    }
    return null;
  }
  return <div className="max-w-xl m-auto mb-4 text-justify">{override}</div>;
};

export default CustomIntroduction;
