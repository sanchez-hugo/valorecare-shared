import React from "react";
import logger from "sabio-debug";
import { Button } from "reactstrap";
import LocationCard from "./LocationCard";
import { getAll, getById, search } from "../../services/locationService";
import PropTypes from "prop-types";
import localeInfo from "rc-pagination/lib/locale/en_US";
import "rc-pagination/assets/index.css";
import Pagination from "rc-pagination";
import SearchBar from "../utilities/SearchBar";

const _logger = logger.extend("LocationsForm");

class Locations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      mappedLocations: [],
      totalCount: 0,
      pageIndex: 1,
      pageSize: 6,
      searchQuery: "",
    };
  }

  componentDidMount() {
    _logger("Locations Mounted");
    const pageIndex = this.state.pageIndex;
    const pageSize = this.state.pageSize;
    this.onGetLocations(pageIndex - 1, pageSize);
  }

  onGetLocations = (pageIndex, pageSize) => {
    getAll(pageIndex, pageSize)
      .then(this.onGetLocationsSuccess)
      .catch(this.onGetLocationsError);
  };

  setLocations = (listOfLocationCards) => {
    this.setState((prevState) => ({ ...prevState, listOfLocationCards }));
  };

  mapLocation = (location) => (
    <LocationCard
      location={location}
      key={location.id}
      onClick={this.onEditClicked}
      onEditLocationsRequest={this.onEditLocationsRequest}
    />
  );

  //#region Click Handlers
  handleAdd = () => {
    this.props.history.push("/location/create");
  };

  onEditClicked = () => {
    this.props.history.push("/location/:id/edit");
  };
  //Memory leak because of onEditLocationRequest

  handleSearchClick = (page) => {
    _logger(page, "page");

    const searchTerm = this.state.searchTerm;
    _logger("search term", searchTerm);

    let locationPageIndex = this.state.currentPageIndex;
    let locationPageSize = this.state.pageSize;

    getById(searchTerm, locationPageIndex, locationPageSize)
      .then(this.onSearchLocationsSuccess)
      .catch(this.onSearchLocationsError);
  };
  //#endregion

  //#region Success/Error Handlers

  onGetLocationsSuccess = (response) => {
    _logger(response, "Paginated Items");
    const locations = response.item.pagedItems;
    const mappedLocations = locations.map(this.mapLocation);
    this.setState((prevState) => {
      return {
        ...prevState,
        locations,
        pageIndex: response.item.pageIndex + 1,
        pageSize: response.item.pageSize,
        totalCount: response.item.totalCount,
        mappedLocations: mappedLocations,
      };
    });
  };

  onGetLocationsError = (response) => {
    _logger("error1", { error: response });
  };

  onEditLocationsRequest = (location) => {
    this.props.history.push(`/location/${location.id}/edit`, location);
    _logger(location);
  };

  onSearchLocationsSuccess = (responseData) => {
    return responseData.item;
  };

  onSearchLocationsError = () => {
    this.resetState();
  };
  //#endregion

  //#region search
  searchLocations = (pageIndex, pageSize, query) => {
    search(pageIndex, pageSize, query)
      .then(this.onGetLocationsSuccess)
      .catch(this.onSearchLocationsError);
  };

  handleSearch = (query) => {
    const searchQuery = query;
    this.setState((prevState) => ({ ...prevState, searchQuery }));
    const pageIndex = 0;
    const pageSize = this.state.pageSize;
    this.searchLocations(pageIndex, pageSize, searchQuery);
  };

  clearSearch = () => {
    this.resetState();
    this.resetSearch();
  };

  resetState = () => {
    this.setState((prevState) => ({
      ...prevState,
      mappedLocations: [],
      locations: [],
      pageIndex: 1,
      pageSize: 3,
      totalCount: 0,
    }));
  };

  resetSearch = () => {
    const searchQuery = "";
    this.setState(
      (prevState) => ({ ...prevState, searchQuery }),
      () => {
        const pageIndex = this.state.pageIndex;
        const pageSize = this.state.pageSize;
        this.onGetLocations(pageIndex, pageSize);
      }
    );
  };
  //#endregion

  onPaginationChange = (page) => {
    const query = this.state.searchQuery;
    _logger(page, "pagination button clicked");
    let pageSize = this.state.pageSize;
    if (query) this.searchLocations(page - 1, pageSize);
    else {
      _logger("here");
      this.setState(
        (prevState) => {
          return {
            ...prevState,
            pageIndex: page,
          };
        },
        () => {
          this.onGetLocations(page - 1, pageSize);
        }
      );
    }
  };

  render() {
    return (
      <React.Fragment>
        <h2>
          <Button
            type="submit"
            className="btn btn-danger"
            onClick={this.handleAdd}
          >
            Create
          </Button>
        </h2>

        <div className="col-md-3 ml-auto">
          <SearchBar
            searchPaginated={this.handleSearch}
            getPaginated={this.onGetLocations}
            clearSearch={this.clearSearch}
            pageIndex={this.state.pageIndex}
            pageSize={this.state.pageSize}
            searchQuery={this.state.searchQuery}
          />
        </div>

        <div className="row">
          {this.state.totalCount ? (
            this.state.listOfLocationsCards
          ) : (
            <h2>No Locations Found</h2>
          )}
        </div>
        <div className="row">{this.state.mappedLocations}</div>
        <h2>
          <div className="row justify-content-md-center">
            <Pagination
              color="secondary"
              onChange={this.onPaginationChange}
              current={this.state.pageIndex}
              total={this.state.totalCount}
              pageSize={this.state.pageSize}
              locale={localeInfo}
            />{" "}
          </div>
        </h2>
      </React.Fragment>
    );
  }
}
Locations.propTypes = {
  history: PropTypes.shape({
    history: PropTypes.func,
    push: PropTypes.func.isRequired,
  }),
  onEditLocationsRequest: PropTypes.func,
};

export default Locations;
