import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import phase1Img from './example.gif';
import phase2Img from './example.gif';
import phase3Img from './example.gif';
import phase4Img from './example.gif';
import roadmap from './roadmap.png';
import beet from './beet.png';

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-family: Chakra Petch,sans-serif;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  background-color: var(--accent);
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [NFTS, setNFTs] = useState([]);
  const [feedback, setFeedback] = useState(`Click mint to get your NFT.`);
  const [mintAmount, setMintAmount] = useState(3);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });
  
  
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
  
function get_all_nfts(){  
  const tokens = data.allTokens;
  tokens.forEach(element => {
   /* const token_url = blockchain.smartContract.methods.tokenURI(element);*/
      fetch('/config/json/' + element + ".json", {
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
    })
    
       .then(function(response){
        /*console.log(response)*/
        return response.json();
      })
      .then(function(myJson) {
        let image_url = "/config/cats/" + myJson.image;
        let image_result = image_url.replace("ipfs://", "");
        let image_results = image_result.replace("QmRJWYg2zmuHPwvaBsXE3jt48XTC3nyTJKrDtKffWrute7/", "");
     /*   document.getElementById("output").innerHTML += myJson.name + "<br />"; */
        var new_nft = document.getElementById("image");
        new_nft.appendChild(document.createElement('img')).src = image_results;
        sleep(200);
      });
    
  });
};

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(blockchain.account, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! click on your collection to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 50) {
      newMintAmount = 50;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };
  
  
  
 const getImageData = () => {
    const canvasEl = elementRef.current;
    let dataUrl = canvasEl.toDataURL("image/png");
    const buffer = Buffer(dataUrl.split(",")[1], "base64");
    return buffer;
  };
  
  
  const fetchMetatDataForNFTS = () => {
    setNFTS([]);
    data.allTokens.forEach((nft) => {
      fetch(nft.uri)
        .then((response) => response.json())
        .then((metaData) => {
          setNFTS((prevState) => [
            ...prevState,
            { id: nft.id, metaData: metaData },
          ]);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };
  
  
  
  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 0, backgroundColor: "var(--accent)" }}
      >
    
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 0}} test>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
   
              width: "100%",
            }}
          >
                        <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 20,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
            $STILL PILL NFTS MINT 
            </s.TextTitle>

                      <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={phase1Img} />
          </s.Container>

            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <span
              style={{
                textAlign: "center",
              }}
            >

            </span>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  1 STILL PILL 10 FTM
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)", paddingRight: "200px", paddingLeft: "200px" }}
                >
Info: Total supply 2500 normal pills + 350 ALL-In-One-Color pills. Preminted 1200 pills (850 pills for airdrop and 350 ALL-In-One-Color pill).
Mint Price 10 FTM.
ALL-In-One-Color pill pills cannot be minted, only exchanged using 7 different colour pills.
Each ALL-In-One-Color pill is a ticket to upcoming raffles.
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "MINT"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
   
        </ResponsiveWrapper>
        <s.Container jc={"center"} ai={"center"} style={{ width: "100%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
                      <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "white",
              padding: 0,
              borderRadius: 0,
              width: "100%",
              color: "black",
              textAlign: "left",
              padding: "100px"
            }}

          >

      <div className="container">
      <div className="left-column">
        <h1>Roadmap</h1>
                                        <s.SpacerSmall />

        <p>
          In order to achieve our mission statement, we have separated our project roadmap into 4 main phases.

        </p>
                                        <s.SpacerSmall />
          <img style={{width: "100%"}} src={roadmap} alt="Phase 4" />

      </div>
      <div className="right-column">
        <div className="phase">
          <img src={phase1Img} alt="Phase 1" />
          <p>
            Phase 1:
                                <s.SpacerSmall />
            We will launch our $STILL pills NFTs. These will come in 7 different colors, collect them all and you will be awarded a ALL COLOR $STILL pill, that will give you access to raffles.

           
          </p>
        </div>
        <div className="phase">
          <img src={beet} alt="Phase 2" />
          <p>
            Phase 2:
                                <s.SpacerSmall />

          Liquidity Bootstrapping Pool (LBP), will go live at BeethovenX while minting to ensure the best price discovery for our users.
                    </p>
        </div>
        <div className="phase">
          <img src={phase3Img} alt="Phase 3" />
          <p>
            Phase 3:
                                <s.SpacerSmall />

            Periodic raffles and giveaways, events with other fantom communities and more.
            Stay tuned for more ALPHA!!!
          </p>
        </div>
        <div className="phase">
          <img src={phase4Img} alt="Phase 4" />
          <p>
            Phase 4:
                                <s.SpacerSmall />

            We will go multi-chain 
          </p>
        </div>
      </div>
    </div>
          </s.Container>
                        <h3>Your Collection:</h3>
                                            <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        get_all_nfts();
                      }}
                    >
                      Click Here To See Your Collection
                    </StyledButton><br></br>
                    Remember to click "connect" first
<p>
<span id="output"></span>
<span id="image"></span>

</p>
<p></p>
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >

            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}


export default App;
