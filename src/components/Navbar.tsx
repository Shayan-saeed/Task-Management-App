import LogoutButton from "./LogoutButton";
import { useLocation } from "react-router-dom";
import { User } from "firebase/auth";

interface NavbarProps {
    currentUser: User | null
}
const Navbar: React.FC<NavbarProps>= ({currentUser}) => {
    const location = useLocation();
    const isBoardPage = location.pathname === "/board";

    return (
        <header className="flex justify-between p-2 mb-6 items-center bg-gray-900 bg-opacity-30 w-full sm:w-auto">
            <div className="flex items-center space-x-2 flex-grow">
                <img src="https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Trello-512.png" alt="trello-logo" className='w-[25px] h-[25px]' />
                <h1 className="text-2xl font-bold font-sans text-white">My Trello Board</h1>
            </div>
            <div className="ml-4 flex-shrink-0 mt-1">
                {isBoardPage && currentUser ? <LogoutButton /> : null}
            </div>
        </header>
    );
}

export default Navbar;