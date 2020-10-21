import React from "react";
//#region rc-pagination
import Pagination from "rc-pagination/lib/Pagination";
import localeInfo from "rc-pagination/lib/locale/en_US";
import "rc-pagination/assets/index.css";
//#endregion
import PropTypes from "prop-types";
import {
  getCreatedBy,
  searchJobs,
  deleteById,
  getJobsNearby,
  searchJobsNearby,
} from "../../services/jobService";
import {
  toastSuccess,
  toastError,
  swalConfirm,
  isRoleOf,
} from "../../services/utilityService";
import Job from "./Job";
import SearchBar from "../utilities/SearchBar";
import "../providers/ProviderFilter.css";

// import debug from "sabio-debug";
// const _logger = debug.extend("Jobs");

export default class Jobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSeeker: this.props.currentUser.roles.includes("Seeker"),
      listOfJobCards: [],
      jobs: [],
      pagination: {
        totalCount: 0,
        currentPage: 1,
        pageIndex: 0,
        pageSize: 9,
      },
      nearby: {
        radius: "",
        zip: "",
      },
      searchQuery: "",
    };
  }

  componentDidMount() {
    const pageIndex = this.state.pagination.pageIndex;
    const pageSize = this.state.pagination.pageSize;

    // If user is a seeker, show them only their jobs

    // If they're a provider or an admin, show nearby

    if (isRoleOf(this.props.currentUser.roles, "Seeker")) {
      this.getJobs(pageIndex, pageSize);
    } else {
      if (this.props.location && this.props.location.state) {
        const zip = this.props.location.state.zip;
        const radius = this.props.location.state.radius;
        this.setNearbyParams(zip, radius);
        this.getNearbyJobs(pageIndex, pageSize, radius, zip);
      } // make the proper call
      else {
        this.props.history.push(`/jobs/nearby`);
      }
    }
  }

  getJobs = (pageIndex, pageSize) => {
    const roles = this.props.currentUser.roles;
    if (roles.includes("Seeker")) {
      getCreatedBy(pageIndex, pageSize)
        .then(this.onGetJobsSuccess)
        .then(this.renderJobs)
        .catch(this.onGetJobsError);
    }
  };

  getNearbyJobs = (pageIndex, pageSize, radius, zip) => {
    getJobsNearby(pageIndex, pageSize, radius, zip)
      .then(this.onGetJobsSuccess)
      .then(this.renderJobs)
      .catch(this.onGetJobsError);
  };

  setNearbyParams = (zip, radius) => {
    const nearby = {
      zip,
      radius,
    };
    this.setState((prevState) => ({ ...prevState, nearby }));
  };

  renderJobs = (jobsPaged) => {
    const jobs = jobsPaged.pagedItems;
    const listOfJobCards = jobsPaged.pagedItems.map(this.mapJob);

    const pagination = {
      totalCount: jobsPaged.totalCount,
      pageIndex: jobsPaged.pageIndex,
      currentPage: jobsPaged.pageIndex + 1,
      pageSize: this.state.pagination.pageSize,
    };

    this.setState((prevState) => {
      return {
        ...prevState,
        listOfJobCards,
        jobs,
        pagination,
      };
    });
  };

  setJobs = (listOfJobCards) => {
    this.setState((prevState) => ({ ...prevState, listOfJobCards }));
  };

  mapJob = (job) => {
    return (
      <Job
        {...this.props}
        key={`Job_${job.id}_by_${job.createdBy.firstName}`}
        job={job}
        handleDeleteJob={this.displayConfirm}
        userId={this.props.currentUser.id}
        isEditing={false}
      />
    );
  };

  removeJobCard = (jobId) => {
    let listOfJobCards = this.state.listOfJobCards;
    listOfJobCards = listOfJobCards.filter(
      (jobCard) => jobCard.props.job.id !== jobId
    );
    this.setJobs(listOfJobCards);
  };

  //#region On Click Handlers
  handleAddJob = () => {
    this.props.history.push(`/jobs/add`);
  };

  handleNewSearch = () => {
    this.props.history.push(`/jobs/nearby`);
  };

  handleDeleteJob = (jobId) => {
    deleteById(jobId)
      .then(this.onDeleteJobSuccess)
      .then(this.removeJobCard)
      .catch(this.onDeleteJobError);
  };

  displayConfirm = (jobId) => {
    const swalTitle = `Are you sure you want to delete job?`;
    const swalText = `Once deleted, you will not be able to recover this job.`;

    swalConfirm(swalTitle, swalText, this.handleDeleteJob, jobId);
  };

  //#endregion

  //#region Success and Error Handlers
  onDeleteJobSuccess = (jobId) => {
    const toastMsg = `Successfully deleted this job.`;
    toastSuccess(toastMsg);
    return jobId;
  };

  onDeleteJobError = (response) => {
    const toastMsg = `Could not remove job. ${response.message}`;
    toastError(toastMsg);
  };

  onGetJobsSuccess = (responseData) => {
    return responseData.item;
  };

  onGetJobsError = (response) => {
    if (response.response.status === 404) {
      // do nothing
    } else {
      const errorMsg = response.response.data.errors[0].toString();
      toastError(errorMsg);
    }

    if (this.state.searchQuery) this.resetState();
  };
  //#endregion

  //#region Search
  onSearchJobsSuccess = (response) => {
    const roles = this.props.currentUser.roles;
    const item = response.item;
    if (roles.includes("Seeker")) {
      const oldPagedItems = item.pagedItems;
      const newPagedItems = oldPagedItems.filter(
        (jobs) => jobs.createdBy.userId === this.props.currentUser.id
      );
      item.pagedItems = newPagedItems;
      item.totalCount = newPagedItems.length;
      item.totalPages = Math.ceil(newPagedItems.length / item.pageSize);
    }

    return item;
  };

  onSearchJobsError = () => {
    this.resetState();
  };

  searchJobs = (query, pageIndex, pageSize) => {
    if (this.state.isSeeker) {
      searchJobs(query, pageIndex, pageSize)
        .then(this.onGetJobsSuccess)
        .then(this.renderJobs)
        .catch(this.onGetJobsError);
    } else {
      const radius = this.state.nearby.radius;
      const zip = this.state.nearby.zip;
      searchJobsNearby(query, pageIndex, pageSize, radius, zip)
        .then(this.onGetJobsSuccess)
        .then(this.renderJobs)
        .catch(this.onGetJobsError);
    }
  };

  handleSearch = (query) => {
    const searchQuery = query;
    this.setState((prevState) => ({ ...prevState, searchQuery }));
    const pageIndex = 0;
    const pageSize = this.state.pagination.pageSize;

    this.searchJobs(searchQuery, pageIndex, pageSize);
  };

  getPaginatedWrapper = (pageIndex, pageSize) => {
    if (this.state.isSeeker) this.getJobs(pageIndex, pageSize);
    else {
      const zip = this.state.nearby.zip;
      const radius = this.state.nearby.radius;
      this.getNearbyJobs(pageIndex, pageSize, radius, zip);
    }
  };

  clearSearch = () => {
    this.resetState();
    this.resetSearch();
  };

  resetState = () => {
    const listOfJobCards = [];
    const jobs = [];
    const pagination = {
      totalCount: 0,
      currentPage: 1,
      pageIndex: 0,
      pageSize: 9,
    };
    this.setState((prevState) => ({
      ...prevState,
      listOfJobCards,
      jobs,
      pagination,
    }));
  };

  resetSearch = () => {
    const searchQuery = "";
    this.setState(
      (prevState) => ({ ...prevState, searchQuery }),
      () => {
        const pageIndex = this.state.pagination.pageIndex;
        const pageSize = this.state.pagination.pageSize;

        if (this.state.isSeeker) this.getJobs(pageIndex, pageSize);
        else {
          const radius = this.state.nearby.radius;
          const zip = this.state.nearby.zip;
          this.getNearbyJobs(pageIndex, pageSize, radius, zip);
        }
      }
    );
  };

  handlePageChange = (page) => {
    const query = this.state.searchQuery;
    let pageIndex = page - 1;
    let pageSize = this.state.pagination.pageSize;
    if (query) this.searchJobs(query, pageIndex, pageSize);
    else {
      this.setState(
        (prevState) => {
          return {
            ...prevState,
            pagination: {
              ...prevState.pagination,
              currentPage: page,
              pageIndex: page - 1,
            },
          };
        },
        () => {
          pageIndex = this.state.pagination.pageIndex;
          pageSize = this.state.pagination.pageSize;

          if (this.state.isSeeker) this.getJobs(pageIndex, pageSize);
          else {
            const radius = this.state.nearby.radius;
            const zip = this.state.nearby.zip;
            this.getNearbyJobs(pageIndex, pageSize, radius, zip);
          }
        }
      );
    }
  };

  //#endregion

  render() {
    const isSeeker = this.state.isSeeker;

    return (
      <div className="container-main container-fluid">
        <div className="row">
          <div className="container-fluid px-md-5">
            <div className="px-md-3 mx-md-5">
              <div className="row">
                <h1 className="col text-center display-5">Jobs</h1>
              </div>
              <div className="row d-flex">
                <div className="ml-auto col-md-7 mr-0 pr-0">
                  <SearchBar
                    searchPaginated={this.handleSearch}
                    getPaginated={this.getPaginatedWrapper}
                    clearSearch={this.clearSearch}
                    pageIndex={this.state.pagination.pageIndex}
                    pageSize={this.state.pagination.pageSize}
                    searchQuery={this.state.searchQuery}
                  />
                </div>

                <div className="col-md-1 ml-0 pl-0">
                  {isSeeker ? (
                    <button
                      type="button"
                      className="btn btn-success btn-block"
                      onClick={this.handleAddJob}
                    >
                      <i className="fas fa-plus" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={this.handleNewSearch}
                    >
                      <i className="fas fa-redo" />
                    </button>
                  )}
                </div>
              </div>
              {this.state.pagination.totalCount ? (
                <div className="row card-group my-3">
                  {this.state.listOfJobCards}
                </div>
              ) : (
                <div className="row justify-content-center">
                  {this.state.isSeeker
                    ? "No jobs have been made."
                    : "No jobs nearby."}
                </div>
              )}

              <div className="row justify-content-center">
                <Pagination
                  total={this.state.pagination.totalCount}
                  current={this.state.pagination.currentPage}
                  pageSize={this.state.pagination.pageSize}
                  pageIndex={this.state.pagination.pageIndex}
                  onChange={this.handlePageChange}
                  locale={localeInfo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Jobs.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.object,
    pathname: PropTypes.string,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      user: PropTypes.string,
    }).isRequired,
    path: PropTypes.string,
  }),
  currentUser: PropTypes.shape({
    id: PropTypes.number,
    roles: PropTypes.arrayOf(PropTypes.string),
  }),
};
