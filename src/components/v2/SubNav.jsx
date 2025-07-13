const SubNav = ({ listNav, selectedTab, handleTabClick, type }) => {
    const formatString = (input) => {
        if (input === "User Information") {
            return "user";
        }
        return input.replace(" ", "");
    }

    const className = `${selectedTab.toLowerCase()}-nav`;

    return (
        <div className="bottom-tap-bar">
            {
                listNav.map((tab, index) => (
                    <div
                        key={tab}
                        className={`tab 
                            ${selectedTab === "User Information" ? "user-nav" : ""}
                            ${selectedTab === tab && ["Affiliate", "Binary", "Direct"].includes(tab) ? "affiliate-nav" : ""}
                            ${selectedTab === tab && ["Mining", "Claim", "Withdraw", "Balance"].includes(tab) ? "his-nav" : ""}
                            ${selectedTab === tab && ["Balance", "Mining", "Claim", "Withdraw", "Balance"].includes(tab) ? "das-nav" : ""}
                            ${selectedTab === tab ? "expanded" : ""}`}
                        onClick={() => handleTabClick(tab, type)}
                    >
                        <img
                            style={{
                                width: formatString(selectedTab) === "user" ? "25px" : undefined,
                            }}
                            className={`icon-${tab.toLowerCase()}`}
                            src={`/iconmenu/${selectedTab === tab ? "white" : "white"}/${index+1}.png`}
                            alt={tab}
                        />
                        {/* <span className={`text ${selectedTab === "User Information" ? "user-nav-text" : ""}`} >{tab}</span> */}
                    </div>
                ))
            }
        </div>
    )
};

export default SubNav;