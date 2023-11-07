import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import DashboardLayout from '@/layouts/dashboard/_dashboard';
import Button from '@/components/ui/button';
import routes from '@/config/routes';

const GettingStartedPage: NextPageWithLayout = () => {
  return (
    <>
      <NextSeo title="FundUs" description="FundUs| Your home for help" />
      <div className="home-panel flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-wider text-green-900 drop-shadow-lg dark:text-green-900 sm:mb-10 sm:text-4xl">
            Your home for help
          </h2>
          <a href={`${routes.sign}`}>
            <Button
              color="white"
              className="text-lg font-bold text-green-800 shadow-md"
            >
              Start a Project
            </Button>
          </a>
        </div>
      </div>
    </>
  );
};

GettingStartedPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default GettingStartedPage;
