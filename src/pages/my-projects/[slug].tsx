import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import DashboardLayout from '@/layouts/dashboard/_dashboard';
import Base from '@/components/ui/base';
import ProgressBar from '@ramonak/react-progress-bar';
import { getProjectById, Project } from '@/api/projects';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import nft from '../../assets/images/nft/nft-1.jpg';

const ProjectPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { publicKey, wallet } = useWallet();
  const { slug } = router.query;

  // Use a state variable to store the project data
  const [project, setProject] = useState<Project | null>(null);

  // Fetch the project data when the component mounts
  useEffect(() => {
    if (slug) {
      const project_id = slug as string;
      // Call the getProjectById function to fetch the data
      getProjectById(project_id, '').then((data) => {
        setProject(data);
      });
    }
  }, [slug]);

  const caclPercent = (current: number, goal: number) => {
    return (current / goal) * 100;
  };

  return (
    <>
      <NextSeo
        title={project?.title || 'Loading...'}
        description={project?.title || 'Loading...'}
      />
      <Base>
        <h1 className="mb-4 text-center text-4xl font-bold">
          {project?.title || 'Loading...'}
        </h1>
        {project ? (
          <div className="flex">
            <div className="w-1/2 p-4">
              <p className="mb-4">
                <strong>Project owner: </strong>
                {project.owner}
              </p>
              <p className="mb-4 text-justify">
                <strong>Description: </strong>
                {project.description}
              </p>
              <p className="mb-4 text-justify">
                <strong>Category: </strong>
                {project.category}
              </p>
              <p className="mb-4 text-justify">
                <strong>Start date: </strong>
                {project.start_at}
              </p>
              <p className="mb-4 text-justify">
                <strong>End date: </strong>
                {project.end_at}
              </p>
              <p className="mb-4">
                <strong>Goal Amount: </strong>
                {project.pool} ALEO
              </p>
              <p className="mb-4">
                <strong>Raised Amount: </strong>
                {project.raised} ALEO
              </p>
              <p className="mb-4">
                <strong>Status: </strong>
                {project.status}
              </p>

              <ProgressBar
                className="mb-4"
                height="30px"
                bgColor="#009E5F"
                borderRadius="10px"
                isLabelVisible={
                  caclPercent(project.raised, project.pool) >= 10 ? true : false
                }
                completed={caclPercent(project.raised, project.pool)}
              ></ProgressBar>
            </div>

            <div className="w-1/2 p-4">
              <img
                src={String(project.img) || String(nft)}
                alt={project.title}
                className="rounded border border-gray-300 object-cover"
              />
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Base>
    </>
  );
};

ProjectPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProjectPage;
