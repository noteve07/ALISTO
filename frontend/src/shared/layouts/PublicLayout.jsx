// shared/layouts/PublicLayout.jsx

import { Outlet } from 'react-router-dom'

const PublicLayout = () => {
    return (
        <div className="public-layout">
            <Outlet />
        </div>
    )
}

export default PublicLayout