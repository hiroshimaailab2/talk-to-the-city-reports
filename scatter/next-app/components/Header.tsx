import useInferredFeatures from "@/hooks/useInferredFeatures";
import { Translator } from "@/hooks/useTranslatorAndReplacements";
import { Result } from "@/types";

type HeaderProps = Result & {
  translator: Translator;
};

const Header = (props: HeaderProps) => {
  const { config } = props;
  const { t, languages, langIndex, setLangIndex } = props.translator;
  const { hasTranslations } = useInferredFeatures(props);

  return (
    <div
      className="fixed top-0 fixed-header"
      style={{ zIndex: "9999", width: "100%", background: "#f2f3f3" }}
    >
      <center style={{ background: "#D4D9E8" }}>
        <img
          src={`/img/header.png`}
          alt={`シン東京2050（仮称）策定に向けたご意見大募集 ～みんなでつくる「シン東京2050」プロジェクト～`}
          style={{ width: "100%", maxWidth: "960px", height: "auto" }}
        />
      </center>
      <div className="flex justify-between w-full h-7 bg-gradient-to-r from-blue-900 to-white z-10 leading-7">
        <div className="text-white mx-2">Talk to the City</div>
        {hasTranslations && (
          <div>
            {languages.map((lang, i) => (
              <button
                className="text-white mx-2"
                style={{ opacity: langIndex === i ? 1 : 0.7 }}
                key={lang.name}
                onClick={() => setLangIndex(i)}
              >
                <img
                  className="w-5 inline-block leading-5 pb-[4px] hover:shadow-2xl shadow-white"
                  src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${lang.flag}.svg`}
                  alt=""
                />
                {/* {t(lang.name)} */}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
