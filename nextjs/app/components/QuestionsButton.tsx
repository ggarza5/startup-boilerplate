import { useRouter } from 'next/navigation';

export const QuestionsButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/questions')} // Add this line for navigation
      className="mt-4 bg-gray-500 hover:bg-gray-700 dark:bg-gray-700 hover:dark:bg-gray-600 text-white dark:text-black font-bold py-2 px-4 rounded"
    >
      Go to Questions
    </button>
  );
};
