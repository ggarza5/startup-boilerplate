const Sidebar = ({ startSection }: { startSection: (section: string) => void }) => {
  return (
    <div className="sidebar">
      <h2>Sections</h2>
      <button onClick={() => startSection('math')}>Math</button>
      <button onClick={() => startSection('reading')}>Reading</button>
      <button onClick={() => startSection('writing')}>Writing</button>
    </div>
  );
};

export default Sidebar;