type TabContentProps = {
  id: string;
  activeTab: string;
  children: any;
};

const TabContent = (props: TabContentProps) => {
  const { id, activeTab, children } = props;

  return activeTab === id ? children : null;
};

export default TabContent;
