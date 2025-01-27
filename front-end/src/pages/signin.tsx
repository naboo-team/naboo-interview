import { PageTitle, SigninForm } from '@/components';
import { withoutAuth } from '@/hocs';
import { Paper } from '@mantine/core';
import Head from 'next/head';

const Signin = () => {
  return (
    <>
      <Head>
        <title>Connection | CDTR</title>
      </Head>
      <PageTitle title="Connection" />
      <Paper shadow="xs" p="md">
        <SigninForm />
      </Paper>
    </>
  );
};

export default withoutAuth(Signin);
