type TabNavProps = {
  id: string;
  title: string;
  activeTab: string;
  setActiveTab: Function;
};

const TabNav = (props: TabNavProps) => {
  const { id, title, activeTab, setActiveTab } = props;

  const handleTabClick = () => setActiveTab(id);

  return (
    <li onClick={handleTabClick} className={activeTab === id ? 'is-active' : ''} title={`Click to select ${title.toLowerCase()}`}>
      {title}
    </li>
  );
};

export default TabNav;
