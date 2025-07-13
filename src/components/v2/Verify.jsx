import ApproveAll from "./ApproveAll";
import ApproveSection from "./ApproveSection";
import Documents from "./Documents";
import Information from "./Information";
import Selfie from "./Selfie";

const Verify = (props) => {
    return (
        <div className="animation-fadeIn">
            <div className="form-container" style={{ padding: 0 }}>
                {props.verifyShowView === 1 && <ApproveAll />}
                {props.verifyShowView === 2 && <ApproveSection />}
                {props.verifyShowView === 3 && <Information action={props.action} handleSwipe={props.handleSwipe} />}
                {props.verifyShowView === 4 && <Documents action={props.action} handleSwipe={props.handleSwipe} />}
                {props.verifyShowView === 5 && <Selfie action={props.action} handleSwipe={props.handleSwipe} />}
            </div>
        </div>
    )
}

export default Verify;