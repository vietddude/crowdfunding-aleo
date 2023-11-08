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
import Popup from 'reactjs-popup';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  Transaction,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import Button from '@/components/ui/button';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const contractName = process.env.NEXT_PUBLIC_CONTRACT_NAME || "project_crowfunding7.aleo"

function renderActionButtons(
  publicKey: string,
  project: Project,
  openPopup: any
) {
  if (!publicKey) {
    return (
      <Button
        className="mt-8 shadow-card dark:bg-gray-700 md:h-10 md:px-5 xl:h-12 xl:px-7"
        disabled
      >
        {'Connect to Wallet'}
      </Button>
    );
  }

  if (publicKey === project.address_owner) {
    return <p>You own this project</p>;
  }

  if (project?.raised <= project?.pool) {
    if (project.status === 'Ongoing') {
      return (
        <Button
          className="mt-8 shadow-card dark:bg-gray-700 md:h-10 md:px-5 xl:h-12 xl:px-7"
          onClick={openPopup}
        >
          {'Donate'}
        </Button>
      );
    } else if (project.status === 'Finished') {
      return <p>Project ended</p>;
    } else if (project.status === 'Upcoming') {
      return <p>Not started yet</p>;
    }
  }

  return (
    <Button
      className="mt-8 shadow-card dark:bg-gray-700 md:h-10 md:px-5 xl:h-12 xl:px-7"
      disabled
    >
      {'Connect to Wallet'}
    </Button>
  );
}

const ProjectPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { publicKey, wallet } = useWallet();
  const { slug } = router.query;
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    toast.success('Copied to clipboard!');
    // console.log("success")
    setCopied(true);
  };

  const openPopup = () => {
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  const handleAmountChange = (e: any) => {
    setAmount(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const aleoTransaction = Transaction.createTransaction(
        publicKey || '',
        WalletAdapterNetwork.Testnet,
        contractName,
        'deposit_project',
        [
          `${project?.project_hash}field`,
          `${project?.address_owner}`,
          `${amount}field`,
        ],
        350000
      );

      const txId =
        (await (wallet?.adapter as LeoWalletAdapter).requestTransaction(
          aleoTransaction
        )) || '';
      console.log(txId);
      toast.success(`Transaction complete: ${txId}`);
      // Close the popup
      closePopup();
    } catch (error) {
      toast.error('Error while handling submission');
      console.error('Error while handling submission:', error);
    }
  };

  // Use a state variable to store the project data
  const [project, setProject] = useState<Project | null>(null);
  const [address_owner, setAddressOwner] = useState<string>('');
  // Fetch the project data when the component mounts
  useEffect(() => {
    if (slug) {
      const project_id = slug as string;
      // Call the getProjectById function to fetch the data
      getProjectById(project_id, '').then((data) => {
        setProject(data);
        setAddressOwner(data.address_owner);
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

              <p className="mb-4">
                <strong>Project address: </strong>
                <CopyToClipboard text={address_owner} onCopy={handleCopy}>
                  <span className="mb-4 text-justify">
                    {project.address_owner.length > 30
                      ? `${project.address_owner.slice(0, 30)}...`
                      : project.address_owner}
                  </span>
                </CopyToClipboard>
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
              <div className="flex justify-center">
                {publicKey &&
                  renderActionButtons(publicKey, project, openPopup)}
                <Popup
                  open={isPopupOpen}
                  closeOnDocumentClick
                  onClose={closePopup}
                >
                  <div className="flex flex-col items-center rounded border-2 border-gray-900 bg-white p-4">
                    <h3 className="mb-2 text-lg font-semibold">
                      Enter the amount:
                    </h3>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="Enter the amount"
                      className="h-11 w-full appearance-none rounded-lg border-2 border-gray-600 bg-transparent px-3 py-1 text-sm tracking-tighter outline-none transition-all placeholder:text-gray-600 focus:border-white"
                    />
                    <Button
                      onClick={handleSubmit}
                      className="mt-8 shadow-card dark:bg-gray-700 md:h-10 md:px-5 xl:h-12 xl:px-7"
                    >
                      Submit
                    </Button>
                  </div>
                </Popup>
              </div>
            </div>

            <div className="w-1/2 p-4">
              <img
                src={String(project.img) || String(nft)}
                alt={project.title}
                className="rounded border-2 border-green-800 object-cover shadow-lg"
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
