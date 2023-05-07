import { useState, useEffect } from "react";

export default function Status() {
    const apiURL = "https://backend.vflowtechiot.com";
    const [access_token, setAccessToken]                = useState("");         // Sore Tokens.
    const [access_token_1, setAccessToken1]             = useState("");
    const [refresh_token, setRefreshToken]              = useState("");
    const [refresh_token_1, setRefreshToken1]           = useState("");
    const [access_token_1_temp, setAccessToken1Temp]    = useState("");
    
    // To disable login button if parameter is empty
    const [btnStatus, setbtnStatus]             = useState(false);
    //  false   - button disabled
    //  true    - button enabled

    // To disable drop down list if not logged in.
    const [ddlStatus, setddlStatus]             = useState(false);
    //  false   - drop down list disabled
    //  true    - drop down list enabled

    // To setup organisation in drop down list
    const [ddlOption, setddlOption]             = useState([]);
    //  []      - empty
    //  others  - data is filled for drop down list to map
    
    // To read all organisation for drop down list
    const [orgVal, setorgVal]                   = useState([]);
    //  []      - empty
    //  others  - value stored

    // Store Organisation Number
    const [orgNo, setorgNo]                     = useState("");
    //  ""      - no organisation number
    //  others  - an organisation number
    
    // Check if organisation have been selected
    const [orgSelected, setorgSelected]         = useState(false);
    //  false   - drop down list not selected
    //  true    - drop down list selected
    
    // Reading from local json file
    const [unitInfo, setunitInfo]               = useState([]);
    //  []      - empty
    //  others  - it stores [key, id, name, text, value, valuetxt]

    // Store project ID (A project is a directory before gateway)
    const [projectID, setprojectID]             = useState("");
    //  ""      - no project id
    //  others  - an project id

    // Ping update in unitInfo
    const [pingUnitInfo, setpingUnitInfo]       = useState(true);
    //  false   - not pinged
    //  true    - pinging

    // 1. Start of code to check for button status.
    function btnStatusFunc()
    {
        // if val1 and val2 is not empty, enable login button
        // reset oganisation selected at the same time.
        let val1 = document.getElementById("username").value;
        let val2 = document.getElementById("password").value;
        if (val1 != "" && val2 != "")
        {
            setbtnStatus(true);         // Enable login button
            setorgSelected(false);      // Reset organisation selected.
            setorgVal([]);              // Reset organisation value
        }
    }

    // 2. Next line of code for logging in.
    function loginFunc(Username, Userpwd) 
    {
        const loginURL = apiURL.concat("/api/sign-in");             // Add API directory to url
        fetch(loginURL, {
            "method": "POST",                                       // Post method
            "headers": {'Content-Type': 'application/json'},
            "body": JSON.stringify({
                email: Username,
                password: Userpwd
            })
        })
        .then(response => response.json())
        .then(response => {                                         // Set response to individual variable
            setAccessToken(response.access_token);                  // This is for AccessToken
            setRefreshToken(response.refresh_token);                // This is for RefreshToken
            setorgVal(response.orgs);                               // This is for a list of JSON file
        })
        .catch(err => {console.log(err)});
    }

    // 3. if orgVal have been rendered, execute the following task.
    useEffect(() => {
        if (orgVal.length > 0)
        {
            let tempList = [];                                      // Just a temporary variable
            for (let i=0; i<orgVal.length; i ++)                    // i is meant for counting
            {
                if (i == 0)                                         // add empty selection on initial
                {
                    const newOrg = {
                        key: "",
                        text: "Select a Group",
                        value: ""
                    };    
                    tempList.push(newOrg);                          // Append to list
                }
                const newOrg = {
                    key: orgVal[i].id,
                    text: orgVal[i].name,
                    value: orgVal[i].id
                };
                tempList.push(newOrg);                              // Append to list
            }
            setddlStatus(true);
            setddlOption(tempList);
        }
    }, [orgVal]);

    // 4. organisation login for 2nd AccessToken
    function orgLoginFunc(OrgNo)
    {
        if(OrgNo != "")                                             // if Null organisation is not selected
        {
            setorgNo(OrgNo);                                        // Store organisation number into a variable
            const orgLoginURL = apiURL.concat("/api/orgs/", OrgNo, "/sign-in")      // Add API directory to url
            fetch(orgLoginURL, {
                "method": "POST",                                   // A POST
                "headers": {
                    'Content-Type': 'application/json',
                    'Auth-Token' : access_token
                },
                "body": JSON.stringify({})
            })
            .then(response => response.json())
            .then(response => {
                setAccessToken1(response.access_token);             // This is for 2nd AccessToken
                setRefreshToken1(response.refresh_token);           // This is for 2nd RefreshToken
            })
            .catch(err => {console.log(err)});
        }
        else
        {
            setorgSelected(false);                                  // Reset drop down list to be not selected.
        }
    }

    // 5. if access_token_1 is rendered, then render status GUI.
    useEffect(() => {
        if (access_token_1 != "")                                   // If access_token_1 is rendered
        {
            if (access_token_1_temp != access_token_1)
            {
                setAccessToken1Temp(access_token_1);
                setunitInfo([]);
            }
            setorgSelected(true);                                   // Set organisation as selected.
            getProjectID();
        }
    }, [access_token_1]);

    // 6.1. Initialise all units to be rendered
    function InitAllUnits() {
        let unitData = require('./project_70_units.json');          // Read JSON file from local directory
        let tempUnitInfo = [];                                      // A temporary storage
        for (let i=0; i < unitData.assets.length; i ++)             // i is for counting
        {
            let tempNullStatus = "Unit not available"
            const newUnitData = {
                key: i,                                             // Key of div component
                id: -1,                                             // ID of unit component
                text: unitData.assets[i].name,                      // Text of div component
                value: unitData.assets[i].gateWayName,              // Value to compare with actual unit retrieve from API
                valueTxt: tempNullStatus                            // A readability text
            };    
            tempUnitInfo.push(newUnitData);
        }
        setunitInfo(tempUnitInfo);
    }

    // 6.2 This is to retrieve project ID from a recorded GATEWAY name.
    function getProjectID() 
    {
        // Add API directory to url
        let loginURL = apiURL.concat("/api/iot_mgmt/orgs/", orgNo,"/projects?page_size=1000&from=0&is_archived=false");
        // Set Authentication code
        let tempAuthVal = "Bearer ".concat(access_token_1);
        fetch(loginURL, {
            "method": "GET",                                        // A GET
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': tempAuthVal
            }
        })
        .then(response => response.json())
        .then(response => {  
            let unitData = require('./project_70_units.json');
            let projectid = "";
            for (let i=0; i<response.projects.length; i++)
            {
                if (response.projects[i].name == unitData.name)
                {
                    projectid = response.projects[i].id;            // If project id exist in the organisation, break
                    break;
                }
            }
            InitAllUnits();                                         // Re-initialise unit. 
            setprojectID(projectid);                                // Store project id, null or not.
        })
        .catch(err => {console.log(err)});
    }

    // 7. If project is valid and project id is rendered, execute to read if the gateway of the unit exist.
    useEffect(() => {
        if (projectID != "")
            getUnitID();                                            // if project is available, check for gateway name
    }, [projectID]);

    // 8. Connect to API and read if gateway of unit is available.
    function getUnitID() 
    {
        // Add API directory to url
        const unitIDURL = apiURL.concat("/api/iot_mgmt/orgs/", orgNo,"/projects/", projectID, "/gateways?page_size=10000&from=0");
        // Set Authentication code
        const tempAuthVal = "Bearer ".concat(access_token_1);
        fetch(unitIDURL, {
            "method": "GET",                                        // A GET
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': tempAuthVal
            }
        })
        .then(response => response.json())
        .then(response => {  
            let unitData = unitInfo;                                // temporarily retrieve unitInfo
            for (let i=0; i<response.gateways.length; i++)
            {
                for (let x=0; x<unitData.length; x++)
                {
                    // if gateway exist, change colour and text
                    if (response.gateways[i].name == unitData[x].value)
                    {
                        unitData[x].id = response.gateways[i].id;
                        document.getElementById(x).style.backgroundColor= "#D4D4D4";
                        unitData[x].valueTxt = "No Data Available";
                        document.getElementById(x).innerHTML = unitData[x].valueTxt;
                    }
                }
            }
            setunitInfo(unitData);
            setpingUnitInfo(true);
        })
        .catch(err => {console.log(err)});
    }

    // 9. if unitInfo have id stored
    useEffect(() => {
        if (pingUnitInfo)
        {
            let checkUpdate = false;
            for (let i=0; i<unitInfo.length; i++)
            {
                if (unitInfo[i].id != "-1")
                {
                    checkUpdate = true;
                    break;
                }
            }
            if (checkUpdate)
            {
                let date1 = Date.now();
                let date2 = date1-(1*60000)
                getUnitStatus(date1, date2);
            }
            setpingUnitInfo(false);
        }
    }, [pingUnitInfo]);

    function getUnitStatus(date1, date2) {
        for (let i = 0; i<unitInfo.length; i++)
        {
            if (unitInfo[i].id != "-1")
            {
                const UnitStatusURL = apiURL.concat("/api/iot_mgmt/orgs/", orgNo,"/projects/",
                    projectID, "/gateways/",unitInfo[i].id,
                    "/data_dump_index?page_size=40&page_number=1&to_date=",date1,"&from_date=",date2);
                const tempAuthVal = "Bearer ".concat(access_token_1);
                fetch(UnitStatusURL, {
                    "method": "GET",
                    "headers": {
                        'Content-Type': 'application/json',
                        'Authorization': tempAuthVal
                    }
                })
                .then(response => response.json())
                .then(response => {
                    if(response.data_dumps.length>0)
                    {
                        document.getElementById(i).style.backgroundColor= "green";
                        unitInfo[i].valueTxt = "Unit is Online";
                        document.getElementById(i).style.color = "white";
                        document.getElementById(i).innerHTML = unitInfo[i].valueTxt;
                    }
                    else
                    {
                        document.getElementById(i).style.backgroundColor= "red";
                        unitInfo[i].valueTxt = "Not sending Data";
                        document.getElementById(i).style.color = "white";
                        document.getElementById(i).innerHTML = unitInfo[i].valueTxt;
                    }
                })
                .catch(err => {console.log(err)});
            }
        }
    }

    return (
        <div className="statusContainer">
            <div className="loginContainer">
                <div className="loginInfoContainer">
                    <div className="loginInfo">Username: </div>
                    <input className="inputBx" id="username" onChange={() => btnStatusFunc()}/>
                </div>
                <div className="loginInfoContainer">
                    <div className="loginInfo">Password: </div>
                    <input className="inputBx" type="password" id="password" onChange={() => btnStatusFunc()}/>
                </div>
                <button className="loginBtn" id="loginBtn" disabled = {btnStatus ? false : true}
                    onClick={() => loginFunc(
                        document.getElementById("username").value,
                        document.getElementById("password").value,
                    )}>
                    Login
                </button>
            </div>
            <div className="loginInfoContainer">
                <div className="loginInfo">Organisation Group</div>
                <select className="inputBx" id="orgNo" disabled={ddlStatus ? false : true}
                    onChange={() => orgLoginFunc(document.getElementById("orgNo").value)}>
                    {ddlOption.map(currentOption => (
                        <option key={currentOption.key} value={currentOption.value}>
                            {currentOption.text}
                        </option>
                    ))} 
                </select>
            </div>
            <div className="aline"/>
            <div className="unitsStatusContainer">
                {orgSelected ? 
                    unitInfo.map(currentOption => (
                        <div className="unitStatusContainer" key={currentOption.key} value={currentOption.value}>
                            <div className="unitStatusName">{currentOption.text}</div>
                            <div id={currentOption.key} style={{
                                width: "100%", 
                                height: "4rem", 
                                backgroundColor:"orange",
                                borderRadius: "1rem",
                                display: "flex",
                                alignItems: "center",
                                textAlign: "center",
                                transition: "2s",
                                width: '5rem',
                                overflow: 'wrap' 
                            }}>{currentOption.valueTxt}</div>
                        </div>
                    ))
                    : 
                    <></>
                }
            </div>
        </div>
    );
}