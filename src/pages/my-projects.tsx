import React, { useEffect, useState } from 'react';
import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import DashboardLayout from '@/layouts/dashboard/_dashboard';
import Base from '@/components/ui/base';
import { getMyProjects, Project } from '@/api/projects';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { project_id: projectId, title, description, img, status } = project;
  const limitedDescription =
    description.length > 300 ? description.slice(0, 200) + '...' : description;

  return (
    <div className="project-card relative m-4 rounded border border-gray-300 p-4">
      <a href={`/my-projects/${projectId}`} className="flex">
        <img
          src={String(img)}
          alt={title}
          className="h-[400px] w-1/2 rounded object-scale-down"
        />
        <div className="ml-4 flex-1">
          <br></br>
          <p className="text-4xl font-bold">{title}</p>
          <br></br>
          <p className="text-justify">{limitedDescription}</p>
          <p className="absolute bottom-4 right-4 text-right font-bold italic">
            {status}
          </p>
        </div>
      </a>
    </div>
  );
};

const MyProjects: NextPageWithLayout = () => {
  const { publicKey } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch the initial list of projects when the component mounts
  useEffect(() => {
    if (publicKey) {
      getMyProjects(publicKey).then((data) => {
        setProjects(data);
      });
    }
  }, [publicKey]);

  return (
    <>
      <NextSeo title="My Projects" description="List of My Projects" />
      <Base>
        <h1 className="mb-4 text-center text-4xl font-bold">
          List of My Projects
        </h1>

        <div className="justify-left mt-10 flex-row flex-wrap">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </Base>
    </>
  );
};

MyProjects.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default MyProjects;
