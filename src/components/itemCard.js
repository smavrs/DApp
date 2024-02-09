// ItemCard.js
import React from "react";
import "./itemCard.css";

function ItemCard({
  details,
  bidHandler,
  connectedWallet,
  beneficiaryAddress,
  lotteryStage
}) {
  const { img_url, name, bidCount } = details;

  const handleBidClick = () => {
    bidHandler(); // Pass the itemId or any identifier you need
  };

  const isBidDisabled = connectedWallet === beneficiaryAddress || lotteryStage !== 1;

  return (
    <div className="itemcontainer">
      <h3 className="heading">{name}</h3>
      <div className="imgcontainer">
        <img src={img_url} alt="" className="itemimage" />
      </div>
      <span className="info">
        <button
          className="bidButton"
          onClick={handleBidClick}
          disabled={isBidDisabled}
        >
          Bid
        </button>
        <p className="statustext">{bidCount}</p>
      </span>
    </div>
  );
}

export default ItemCard;
