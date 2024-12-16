import Head from "next/head";
import styles from "../styles.module.css";

const CustomHeader = (props: any) => {
  const { config } = props;
  const title = config.name;
  const description = config.description || config.question;
  const gtmId = config.gtmId;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <div className={styles.responsiveBox}></div>
      </Head>
    </>
  );
};

export default CustomHeader;
