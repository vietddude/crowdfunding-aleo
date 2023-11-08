import { useEffect, useState } from 'react';
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||'http://0.0.0.0:4000';

interface Project {
  project_id: string;
  project_hash: string;
  title: string;
  owner: string;
  address_owner: string;
  pool: number;
  raised: number;
  category: string;
  description: string;
  img: File;
  status: string;
  start_at: string;
  end_at: string;
}

interface Transaction {
  address: string;
  amount: number;
  project_id: string;
  project_name: string;
  txn_id: string;
}

function formatDateToDdMmYyyy(dateString: string): string {
  const date = new Date(dateString);
  return date
    .toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-');
}

function setStatus(start_at: string, end_at: string): string {
  const currentDate = new Date();
  let status = 'Ongoing';

  if (currentDate < new Date(start_at)) {
    status = 'Upcoming';
  } else if (currentDate > new Date(end_at)) {
    status = 'Finished';
  }

  return status;
}

function titleCase(str: string) {
  return str
    .toLowerCase()
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function useProjectById(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectById = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/project?project_id=${projectId}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data?.data) {
            const { project_id, address_owner, start_at, end_at, ...restData } =
              data.data;

            const startAt = formatDateToDdMmYyyy(start_at);
            const endAt = formatDateToDdMmYyyy(end_at);
            const currentDate = new Date();
            let status = 'Ongoing';

            if (currentDate < new Date(start_at)) {
              status = 'Upcoming';
            } else if (currentDate > new Date(end_at)) {
              status = 'Finished';
            }

            const updatedProject: Project = {
              project_id,
              address_owner,
              start_at: startAt,
              end_at: endAt,
              status,
              ...restData,
            };
            setProject(updatedProject);
          } else {
            setError('Project not found');
          }
        } else {
          setError('Error fetching project: ' + response.status);
        }
      } catch (error) {
        setError('Error fetching project: ' + error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectById();
  }, [projectId]);

  return { project, loading, error };
}

async function getAllProjects() {
  try {
    const response = await axios.get(`${apiUrl}/projects`);

    if (response.status === 200) {
      const data = response.data.data;

      if (data && Array.isArray(data)) {
        // Assuming data is an array of projects
        data.forEach((project) => {
          project.start_at = formatDateToDdMmYyyy(project.start_at);
          project.end_at = formatDateToDdMmYyyy(project.end_at);
          project.status = setStatus(project.start_at, project.end_at);
        });

        return data;
      } else {
        throw new Error('Response data is not a valid array of projects.');
      }
    } else {
      throw new Error('Failed to fetch projects');
    }
  } catch (error: any) {
    throw new Error('Error fetching projects: ' + error.message);
  }
}

async function addProject(projectData: Project) {
  try {
    const formData = new FormData();
    // Append form fields
    formData.append('title', projectData.title);
    formData.append('owner', projectData.owner);
    formData.append('project_id', projectData.project_id);
    formData.append('address_owner', projectData.address_owner);
    formData.append('pool', projectData.pool.toString());
    formData.append('raised', projectData.raised.toString());
    formData.append('category', projectData.category);
    formData.append('description', projectData.description);
    formData.append('start_at', projectData.start_at);
    formData.append('end_at', projectData.end_at);

    // Append the image as a file
    if (projectData.img instanceof File) {
      formData.append('img', projectData.img, projectData.img.name);
    }

    const response = await axios.post(`${apiUrl}/project/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for sending files
      },
    });
    console.log(response);
    if (response.status === 200) {
      return response;
    } else {
      throw new Error('Failed to add the project');
    }
  } catch (error: any) {
    if (error.response) {
      // Response with an error status (e.g., 4xx, 5xx) was received
      throw new Error(error.response.data.error);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Error adding the project: No response received');
    } else {
      // Something happened in setting up the request that triggered an error
      throw new Error(error.message);
    }
  }
}

async function getMyProjects(address_owner: string) {
  try {
    const response = await axios.get(`${apiUrl}/project`, {
      params: { address_owner },
    });

    if (response.status === 200) {
      const data = response.data.data;

      if (data && Array.isArray(data)) {
        // Assuming data is an array of projects
        data.forEach((project) => {
          project.start_at = formatDateToDdMmYyyy(project.start_at);
          project.end_at = formatDateToDdMmYyyy(project.end_at);
          project.status = setStatus(project.start_at, project.end_at);
        });

        return data;
      } else {
        throw new Error('Response data is not a valid array of projects.');
      }
    } else {
      throw new Error('Failed to fetch projects');
    }
  } catch (error: any) {
    throw new Error('Error fetching projects: ' + error.message);
  }
}

async function getProjectById(
  project_id: string,
  address_owner: string
): Promise<Project> {
  try {
    const params =
      address_owner === '' ? { project_id } : { project_id, address_owner };
    const response = await axios.get(`${apiUrl}/project`, { params });

    if (response.status === 200) {
      const data = response.data.data;

      if (data) {
        data.start_at = formatDateToDdMmYyyy(data.start_at);
        data.end_at = formatDateToDdMmYyyy(data.end_at);
        data.status = setStatus(data.start_at, data.end_at);
        return data;
      } else {
        throw new Error('Response data is invalid.');
      }
    } else {
      throw new Error('Failed to fetch the project.');
    }
  } catch (error: any) {
    throw new Error('Error fetching the project: ' + error.message);
  }
}

async function getTxn(
  address: string
): Promise<(Transaction & { project_name: string })[] | null> {
  try {
    const response = await axios.get(`${apiUrl}/transactions`, {
      params: { address },
    });

    if (response.status === 200) {
      const data: Transaction[] = response.data.data;

      // Assuming you have a function to get the project name for a transaction
      const transactionsWithProjectName = data.map((txn) => ({
        ...txn,
        project_name: titleCase(txn.project_id), // Replace with the actual function to get project name
      }));

      return transactionsWithProjectName;
    } else {
      throw new Error('Failed to fetch the transaction');
    }
  } catch (error: any) {
    throw new Error('Error fetching the transaction: ' + error.message);
  }
}

export {
  useProjectById,
  getAllProjects,
  addProject,
  type Project,
  type Transaction,
  getMyProjects,
  getProjectById,
  getTxn,
};
