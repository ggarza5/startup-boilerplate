import React from 'react';

//take optional url prop
const ConsultationButton: React.FC<{ url?: string }> = ({ url }) => {
  return (
    <a
      href={url || '/consultation'}
      className="font-medium text-center py-2 rounded text-white px-4 duration-200 transition-colors bg-[#1fc0f1] hover:bg-[#03a3d7] dark:bg-[#03a3d7] dark:hover:bg-[#00688a] block md:inline-block"
    >
      Book Tutoring
    </a>
  );
};

export default ConsultationButton;
