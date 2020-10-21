import React from "react";
import PropTypes from "prop-types";
import { convertCostToString } from "../../services/utilityService";

const PriceCard = ({ priceOption, onPriceSelect, isOnlyPrice }) => {
  const buttonNotSelected = "btn btn-secondary btn-select";
  const buttonSelected = "btn btn-success btn-select";

  const priceClicked = (e) => {
    e.preventDefault();
    const target = e.target;

    const priceCollection = document.getElementsByClassName(`btn-select`);

    for (let element = 0; element < priceCollection.length; element++) {
      priceCollection[element].className = buttonNotSelected;
      priceCollection[element].innerText = "Select";
    }
    target.className = buttonSelected;
    target.innerText = "Selected";

    onPriceSelect(priceOption.id, priceOption.unitAmount);
  };

  const CardList = () => {
    if (priceOption.metadata) {
      const metadata = priceOption.metadata;
      if (metadata.list) {
        const listString = metadata.list;
        const listArray = listString.split(",");
        const mappedList = listArray.map(mapListItem);
        return <ul className="list-group list-group-flush">{mappedList}</ul>;
      }
    }
    return null;
  };

  const mapListItem = (item, index) => {
    const iStyle = {
      color: "#29d62c",
    };
    return (
      <li key={index + 1} className="list-group-item font-weight-light">
        <i className="fas fa-check" style={iStyle} />
        {` ${item}`}
      </li>
    );
  };

  const CardImage = () => {
    const imgStyle = {
      width: "100%",
      height: "300px",
      objectFit: "cover",
    };
    if (priceOption.metadata && priceOption.metadata.image) {
      return (
        <img
          className="card-img-top img-fluid"
          src={priceOption.metadata.image}
          alt="care provider and seeker subscription"
          style={imgStyle}
        />
      );
    }
    return null;
  };

  const buildFrequency = (count, interval, hasEvery) => {
    let frequency = hasEvery ? "every" : "";

    if (count === 1) frequency += ` ${interval}`;
    else if (count > 1) frequency += ` ${count} ${interval}s`;

    return frequency;
  };

  const intervalCount = priceOption.recurring.intervalCount;
  const interval = priceOption.recurring.interval;
  const perFrequency = buildFrequency(intervalCount, interval, false);
  const billedFrequency = buildFrequency(intervalCount, interval, true);

  const title = priceOption.nickname ? priceOption.nickname : "";

  const metadata = priceOption.metadata ? priceOption.metadata : null;
  const description =
    metadata && metadata.description ? metadata.description : "";

  return (
    <div id={priceOption.id} className="card p-3 m-1 h-100 rounded-lg">
      <div className="card-body text-center font-weight-light">
        <h1 className="display-7">{title}</h1>
      </div>
      <CardImage />
      <div className="card-body h4">
        <div className="card-text font-weight-light">
          {convertCostToString(priceOption.unitAmount)}
        </div>
        <div className="card-text font-weight-light text-secondary">
          Per {perFrequency}
        </div>
        <div className="card-text font-weight-light text-secondary">
          Billed {billedFrequency}
        </div>
        <div className="card-text">{description}</div>
      </div>
      <CardList />
      <div className="card-body text-center font-weight-light">
        <button
          className={isOnlyPrice ? buttonSelected : buttonNotSelected}
          onClick={priceClicked}
          disabled={isOnlyPrice}
        >
          {isOnlyPrice ? "Selected" : "Select"}
        </button>
      </div>
    </div>
  );
};

PriceCard.propTypes = {
  priceOption: PropTypes.shape({
    id: PropTypes.string.isRequired,
    unitAmount: PropTypes.number.isRequired,
    nickname: PropTypes.string,
    recurring: PropTypes.shape({
      interval: PropTypes.string.isRequired,
      intervalCount: PropTypes.number.isRequired,
    }).isRequired,
    metadata: PropTypes.shape({
      list: PropTypes.string,
      description: PropTypes.string,
      title: PropTypes.string,
      image: PropTypes.string,
    }),
  }).isRequired,
  onPriceSelect: PropTypes.func.isRequired,
  isOnlyPrice: PropTypes.bool.isRequired,
};

export default PriceCard;
