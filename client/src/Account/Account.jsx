import Navigation from "../Components/Navigation/Navigation";
import Header from "../Components/Header/Header";
import "./Account.css";

const Account = () => {
    return (
        <div className="account">
            <Navigation />
            <div className="content">
                <Header />
            </div>
        </div>
    );
};

export default Account;