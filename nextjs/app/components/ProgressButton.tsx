import { useRouter } from 'next/navigation';

export const ProgressButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/progress')} // Add this line for navigation
      className="mt-4 bg-gray-500 hover:bg-gray-700 dark:bg-gray-700 hover:dark:bg-gray-600 text-white dark:text-black font-bold py-2 px-4 rounded"
    >
      Go to Progress
    </button>
  );
};
