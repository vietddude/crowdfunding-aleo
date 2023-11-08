import { useState, ChangeEvent, useEffect } from 'react';
import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import DashboardLayout from '@/layouts/dashboard/_dashboard';
import Base from '@/components/ui/base';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import Button from '@/components/ui/button';
import {
  Transaction,
  WalletAdapterNetwork,
  WalletNotConnectedError,
} from '@demox-labs/aleo-wallet-adapter-base';
import { Project, addProject } from '@/api/projects';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';

const contractName = process.env.NEXT_PUBLIC_CONTRACT_NAME || "project_crowdfunding7.aleo";

function toProjectId(title: string): string {
  return title.replaceAll(' ', '-').toLowerCase();
}

const Create: NextPageWithLayout = () => {
  const { wallet, publicKey } = useWallet();

  const [formData, setFormData] = useState<Project>({
    title: '',
    owner: '',
    project_id: '',
    address_owner: publicKey || '',
    pool: 0,
    raised: 0,
    category: '',
    description: '',
    img: '',
    status: 'Ongoing',
    start_at: '',
    end_at: '',
  });

  const [image, setImage] = useState<File | null>(null);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  let [transactionId, setTransactionId] = useState<string | undefined>();

  const router = useRouter();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const description = event.target.value;
    setFormData((prevFormData) => ({ ...prevFormData, description }));
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      pool: isNaN(value) ? 0 : value,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setImage(file);

      // Create a new File object with a unique name and type
      const uniqueFileName = `${Date.now()}_${file.name}`;
      const imageFile = new File([file], uniqueFileName, { type: file.type });

      setFormData((prevFormData) => ({
        ...prevFormData,
        img: imageFile, // Set the image as a File object
      }));

      setIsImageSelected(true);
    }
  };

  const handleSubmit = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!publicKey) throw new WalletNotConnectedError();

    let pendingToastId; // Declare the variable outside the try-catch block

    try {
      if (!formData.start_at || !formData.end_at) {
        setIsFormValid(false);
        throw new Error('Start and end dates are required.');
      }

      formData.address_owner = publicKey;

      if (!formData.address_owner) {
        setIsFormValid(false);
        throw new Error('Address owner is required.');
      }

      const startDate = new Date(formData.start_at);
      const endDate = new Date(formData.end_at);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        setIsFormValid(false);
        throw new Error('Invalid start or end date format.');
      }

      if (startDate >= endDate) {
        setIsFormValid(false);
        throw new Error('Start date should be before the end date.');
      }

      formData.project_id = toProjectId(formData.title);

      setIsFormValid(true);
      // Show a pending toast message
      pendingToastId = toast('Adding project... Please wait.', {
        autoClose: false,
      });

      // Call the API to add the project
      const result = await addProject(formData);

      // Remove the pending toast
      if (pendingToastId) {
        toast.dismiss(pendingToastId);
      }

      // Check if the API call was successful
      if (result && result.status === 200) {
        // if (true) {
        // Show a success toast message
        // console.log(result?.data?.data?.project_hash, result?.data?.data?.pool);
        const aleoTransaction = Transaction.createTransaction(
          publicKey,
          WalletAdapterNetwork.Testnet,
          contractName,
          'create_project',
          [`${result?.data?.data?.project_hash}field`, `${result?.data?.data?.pool}field`],
          // [`604379448672405679515024718454075807707field`, `5000field`],
          350000
        );

        const txId =
          (await (wallet?.adapter as LeoWalletAdapter).requestTransaction(
            aleoTransaction
          )) || '';
        setTransactionId(txId);
        console.log(transactionId);
        toast.success('Project added successfully');
        // Optionally, you can redirect to a success page.
        router.push(`/my-projects/${result?.data?.data?.project_id}`);
      } else {
        // Show an error toast message
        toast.error('Failed to add the project. Please try again.');
      }
    } catch (error: any) {
      // Remove the pending toast
      if (pendingToastId) {
        toast.dismiss(pendingToastId);
      }
      // Show an error toast message for any caught errors
      toast.error('Error adding the project: ' + error.message);
    }
  };

  useEffect(() => {
    setIsFormValid(true);
  }, [formData.start_at, formData.end_at]);

  return (
    <>
      <NextSeo
        title="Create new Crowdfunding Project"
        description="Create new Crowdfunding Project with Aleo"
      />
      <Base>
        <h1 className="mb-4 text-center text-4xl font-bold">
          Create a new Crowdfunding Project
        </h1>
        <div className="flex">
          <div className="w-2/3 p-4">
            <form
              noValidate
              onSubmit={handleSubmit}
              className="relative flex w-full flex-col rounded-full"
            >
              <label className="flex w-full items-center justify-between py-4">
                Project Name:
                <input
                  className="h-11 w-[80%] appearance-none rounded-lg border-2 border-gray-600 bg-transparent px-3 py-1 text-sm tracking-tighter text-black outline-none transition-all placeholder:text-black focus:border-sky-600"
                  placeholder=""
                  name="title"
                  onChange={handleInputChange}
                  value={formData.title}
                  required
                />
              </label>

              <label className="flex w-full items-center justify-between py-4">
                Project owner:
                <input
                  className="h-11 w-[80%] appearance-none rounded-lg border-2 border-gray-600 bg-transparent px-3 py-1 text-sm tracking-tighter text-black outline-none transition-all placeholder:text-black focus:border-sky-600"
                  placeholder=""
                  name="owner"
                  onChange={handleInputChange}
                  value={formData.owner}
                  required
                />
              </label>

              <label className="flex w-full items-center justify-between py-4">
                Address Owner <br></br>(Public Key):
                <input
                  className="h-11 w-[80%] appearance-none rounded-lg border-2 border-gray-600 bg-transparent px-3 py-1 text-sm tracking-tighter text-black outline-none transition-all placeholder:text-black focus:border-sky-600"
                  name="address_owner"
                  onChange={handleInputChange}
                  value={publicKey || formData.address_owner}
                  required
                />
              </label>

              <label className="flex w-full items-center justify-between py-4">
                Category:
                <select
                  className="h-11 w-[80%] appearance-none rounded-lg border-2 border-gray-600 bg-transparent py-1 text-sm tracking-tighter text-black outline-none transition-all placeholder:text-black focus:border-sky-600"
                  name="category"
                  onChange={handleInputChange}
                  value={formData.category}
                  required
                >
                  <option value="">Select a Category</option>
                  <option value="Environment">Environment</option>
                  <option value="Education">Education</option>
                  <option value="Community">Community</option>
                  <option value="Business">Business</option>
                </select>
              </label>

              <label className="flex w-full items-center justify-between py-4">
                Description:
                <textarea
                  className="w-[80%] appearance-none rounded-lg border-2 border-gray-600 bg-transparent px-3 py-1 text-sm tracking-tighter text-black outline-none transition-all placeholder:text-black focus:border-sky-600"
                  placeholder=""
                  rows={6}
                  style={{ minHeight: '200px' }}
                  name="description"
                  onChange={handleDescriptionChange}
                  value={formData.description}
                  required
                />
              </label>

              <label className="flex w-full items-center justify-between py-4">
                Goal Amount:
                <input
                  className="h-11 w-[80%] appearance-none rounded-lg border-2 border-gray-600 bg-transparent px-3 py-1 text-sm tracking-tighter text-black outline-none transition-all placeholder:text-black focus:border-sky-600"
                  placeholder=""
                  name="pool"
                  onChange={handleAmountChange}
                  value={formData.pool}
                  required
                />
              </label>

              <div className="flex w-full items-center justify-between py-4">
                <div className="flex w-[45%] items-center">
                  Start Date:
                  <input
                    className="h-11 w-[100%] appearance-none rounded-lg border-2 border-gray-600 bg-transparent px-3 py-1 text-sm tracking-tighter text-black outline-none transition-all placeholder:text-black focus:border-sky-600"
                    type="date"
                    name="start_at"
                    onChange={handleInputChange}
                    value={formData.start_at}
                    required
                  />
                </div>
                <div className="flex w-[45%] items-center">
                  End Date:
                  <input
                    className="h-11 w-[100%] appearance-none rounded-lg border-2 border-gray-600 bg-transparent px-3 py-1 text-sm tracking-tighter text-black outline-none transition-all placeholder:text-black focus:border-sky-600"
                    type="date"
                    name="end_at"
                    onChange={handleInputChange}
                    value={formData.end_at}
                    required
                  />
                </div>
              </div>

              <Button
                disabled={
                  !publicKey ||
                  !formData.title ||
                  !formData.owner ||
                  formData.pool === 0 ||
                  !isFormValid ||
                  !isImageSelected
                }
                type="submit"
                className="shadow-card dark:bg-gray-700 md:h-10 md:px-5 xl:h-12 xl:px-7"
              >
                {!publicKey ? 'Connect Your Wallet' : 'Create'}
              </Button>
            </form>
          </div>
          <div className="w-1/3 p-4">
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Selected Image"
                style={{ maxWidth: '100%' }}
                className="rounded-lg border-2 border-gray-600"
              />
            )}
            <input
              className="my-4"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>
      </Base>
    </>
  );
};

Create.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Create;
