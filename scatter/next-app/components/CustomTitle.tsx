import Head from "next/head";

const CustomTitle = (props: any) => {
  const { config } = props;
  const title = config.name;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
    </>
  );
};

export default CustomTitle;
