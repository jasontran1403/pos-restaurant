import React from "react";

const ConfigModal = probs => {
    return (
        <div className="modaly">
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-body">
                    <h4 className="titleHeader">Transaction Settings</h4>

                    <div className="row">
                        <label htmlFor="labelField">Slippage Tolerance</label>
                    </div>

                    <div className="row">
                        <div className="col-md-9 fieldContainer">
                            <input
                                className="inputField"
                                placeholder="1.0%"
                                value={probs.slippageAmount}
                                onChange={e => probs.setSlippageAmount(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3 inputFieldUnitsContainer">
                            <span>%</span>
                        </div>
                    </div>

                    <div className="row">
                        <label htmlFor="labelField">Transaction deadline</label>
                    </div>

                    <div className="row">
                        <div className="col-md-9 fieldContainer">
                            <input
                                className="inputField"
                                placeholder="10"
                                value={probs.deadlineMinutes}
                                onChange={e => probs.setDeadlineMinutes(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3 inputFieldUnitsContainer">
                            <span>minutes</span>
                        </div>
                    </div>
                    <button className="btn btn-success" onClick={probs.onClose}>Save</button>
                </div>
            </div>
        </div>
    )
};

export default ConfigModal;