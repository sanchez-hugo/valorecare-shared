import React from "react";
import PropTypes from "prop-types";

const SearchBar = ({
  searchPaginated,
  clearSearch,
  searchQuery,
}) => {
  const onSearchChange = (e) => {
    const target = e.target;
    const query = target.value;
    if (query !== "") searchPaginated(query);
    else {
      clearSearch();
      // getPaginated(pageIndex, pageSize);
    }
  };

  const handleClear = () => {
    const searchField = document.getElementById("searchbar");
    searchField.value = "";
    clearSearch();
  };

  return (
    <div className="input-group">
      <input
        className="form-control"
        type="text"
        id="searchbar"
        placeholder="Search..."
        aria-label="Search"
        name="search"
        onChange={onSearchChange}
      />
      <div className="input-group-append">
        {searchQuery ? (
          <button
            type="button"
            className="btn"
            aria-hidden="true"
            name="clear"
            onClick={handleClear}
          >
            <i className="fas fa-times-circle" />
          </button>
        ) : null}
      </div>
      <div className="input-group-append">
        <span className="input-group-text">
          <i className="fa fa-search" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  searchPaginated: PropTypes.func.isRequired,
  clearSearch: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
};

export default SearchBar;
