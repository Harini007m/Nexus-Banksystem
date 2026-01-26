import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
    const { user } = useAuth();

    // Check if user is an officer
    const isOfficer = user?.role && [
        'APPLICATION_OFFICER',
        'CREDIT_OFFICER',
        'LEGAL_OFFICER',
        'DISBURSEMENT_MANAGER'
    ].includes(user.role);

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 md:ml-72 flex flex-col">
                <Navbar />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
                {!isOfficer && <ChatBot />}
            </div>
        </div>
    );
};

export default DashboardLayout;
