import React, { FormEvent, useState, useEffect } from 'react';
import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import DashboardLayout from '@/layouts/dashboard/_dashboard';
import Base from '@/components/ui/base';
import { Check } from '@/components/icons/check';
import Button from '@/components/ui/button/button';
import { getAllProjects, Project } from '@/api/projects';

const ProjectCard: React.FC<Project> = ({
  project_id: projectId,
  title,
  description,
  img,
  status,
}) => {
  const limitedDescription =
    description.length > 300 ? description.slice(0, 200) + '...' : description;

  return (
    <div className="project-card relative m-4 rounded border border-gray-300 p-4">
      <a href={`/projects/${projectId}`} className="flex">
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

const Projects: NextPageWithLayout = () => {
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch the initial list of projects when the component mounts
  useEffect(() => {
    getAllProjects().then((data) => {
      setProjects(data);
    });
  }, []); // You don't need to include "projects" as a dependency here

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const filteredProjects = projects.filter((project) =>
      project.title.toLowerCase().includes(search.toLowerCase())
    );
    setProjects(filteredProjects);
  };

  return (
    <>
      <NextSeo
        title="Crowdfunding Projects"
        description="List of Crowdfunding Projects"
      />
      <Base>
        <div>
          <h1 className="mb-4 text-center text-4xl font-bold">
            List of Crowdfunding Projects
          </h1>
          <form
            className="relative flex w-full rounded-full md:w-auto"
            noValidate
            role="search"
            onSubmit={handleSearch}
          >
            <label className="flex w-full items-center">
              <input
                className="h-11 w-full appearance-none rounded-lg border-2 border-gray-200 bg-transparent py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-10 rtl:pr-10 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
                placeholder="Search Project"
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="pointer-events-none absolute flex h-full w-8 cursor-pointer items-center justify-center text-gray-600 hover:text-gray-900 ltr:left-0 ltr:pl-2 rtl:right-0 rtl:pr-2 dark:text-gray-500 sm:ltr:pl-3 sm:rtl:pr-3">
                <Check className="h-4 w-4" />
              </span>
              <Button
                type="submit"
                className="ml-4 shadow-card dark:bg-gray-700 md:h-10 md:px-5 xl:h-12 xl:px-7"
              >
                {'Search'}
              </Button>
            </label>
          </form>
        </div>

        <div className="justify-left mt-10 flex-row flex-wrap">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>
      </Base>
    </>
  );
};

Projects.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Projects;
