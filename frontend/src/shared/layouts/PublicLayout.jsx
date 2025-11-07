import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="public-layout w-full max-w-full overflow-x-hidden">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
