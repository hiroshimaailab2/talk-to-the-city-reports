import React, { useState, useEffect, useRef } from "react";
import { Result } from "@/types";
import useClusterColor from "@/hooks/useClusterColor";
import useTranslatorAndReplacements from "@/hooks/useTranslatorAndReplacements";
import MobileMap from "./MobileMap";
import DesktopMap from "./DesktopMap";

import Header from "./Header";
import Appendix from "./Appendix";
import Outline from "./Outline";
import { isTouchDevice } from "@/utils";

import CustomHeader from "./CustomHeader";
import AfterAppendix from "./AfterAppendix";
import CustomIntroduction from "./CustomIntroduction";

type ReportProps = Result;

const isMobileDevice = () => {
  const mobilePattern = /Android|webOS|iPhone|iPad|Opera Mini/i;
  return mobilePattern.test(navigator.userAgent);
};

const ResponsiveMap = (props: any) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  return isMobile ? <MobileMap {...props} /> : <DesktopMap {...props} />;
};

function Report(props: ReportProps) {
  const [openMap, setOpenMap] = useState<string | null>(null);
  const { config, clusters, translations, overview } = props;
  const color = useClusterColor(clusters.map((c) => c.cluster_id));
  const scroll = useRef(0);
  const translator = useTranslatorAndReplacements(
    config,
    translations,
    clusters
  );

  // wait for one tick to avoid SSR issues
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  if (!ready) return false;

  const { t } = translator;
  const totalArgs = clusters
    .map((c) => c.arguments.length)
    .reduce((a, b) => a + b, 0);

  if (openMap) {
    return (
      <ResponsiveMap
        {...props}
        color={color}
        translator={translator}
        back={() => {
          setOpenMap(null);
          setTimeout(() => window.scrollTo({ top: scroll.current }), 0);
        }}
        fullScreen
        onlyCluster={openMap !== "main" ? openMap : undefined}
      />
    );
  }
  return (
    <>
      <CustomHeader config={config} />
      <div className="mt-9">
        <Outline clusters={clusters} translator={translator} />
        <Header {...props} translator={translator} />
        <div
          className="text-center max-w-3xl m-auto py-8 px-5 responsiveBox"
          style={{ display: openMap ? "none" : "block" }}
        >
          <img
            src="/img/tokyo_symbol&logotype_JP.png"
            alt="東京都"
            style={{
              maxWidth: "160px",
              height: "auto",
              margin: "20px auto 0px auto",
            }}
          />
          <h2 className="text-xl my-3 font-bold">{t(config.name)}</h2>
          <h1 className="text-3xl my-3 mb-10">{t(config.question)}</h1>

          <div id="introduction" className="my-4">
            <CustomIntroduction config={config} translator={translator} />
            <div id="big-map">
              <ResponsiveMap
                {...props}
                translator={translator}
                color={color}
                width={450}
                height={450}
              />
              <button
                className="my-2 underline"
                onClick={() => {
                  scroll.current = window.scrollY;
                  setOpenMap("main");
                }}
              >
                {t("Open full-screen map")}
              </button>
            </div>
            <div id="overview" className="text-left font-bold my-3">
              {t("Overview")}:
            </div>
            <div className="text-left">{t(overview)}</div>
          </div>
          <div id="clusters">
            {clusters
              .sort((c1, c2) => c2.arguments.length - c1.arguments.length)
              .map((cluster) => (
                <div
                  key={cluster.cluster_id}
                  id={`cluster-${cluster.cluster_id}`}
                >
                  <h2
                    className="text-2xl font-semibold my-2 mt-12"
                    style={{ color: color(cluster.cluster_id) }}
                  >
                    {t(cluster.cluster)}
                  </h2>
                  <div className="text-lg opacity-50 mb-3">
                    ({cluster.arguments.length} {t("arguments")},
                    {Math.round((100 * cluster.arguments.length) / totalArgs)}%{" "}
                    {t("of total")})
                  </div>
                  <div className="text-left font-bold my-3">
                    {t("Cluster analysis")}:
                  </div>
                  <div className="text-left">{t(cluster.takeaways)}</div>
                  <div className="text-left font-bold my-3">
                    {t("Representative comments")}:
                  </div>
                  <ul className="text-left list-outside list-disc ml-6 ">
                    {cluster.arguments
                      .sort((a, b) => b.p - a.p)
                      .slice(0, 5)
                      .map((arg, i) => (
                        <li key={i} className="italic">
                          {t(arg.argument)}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
          </div>
          <Appendix config={config} translator={translator} />
          <AfterAppendix />
        </div>
      </div>
    </>
  );
}

export default Report;
