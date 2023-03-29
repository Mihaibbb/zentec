import "./Sterilizations.css";
import Header from "../Components/Header/Header";
import Navigation from "../Components/Navigation/Navigation";

const Sterilizations = ({ data }) => {
    return (
        <div classname="sterilizations">
            <Navigation page="sterilizations" />
            <div className="content">
                <Header data={data} />
            </div>
        </div>
    );
};

export default Sterilizations;