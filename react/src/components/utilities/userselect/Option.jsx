import { components } from 'react-select';
import React from 'react';
import PropTypes from 'prop-types';
import './option.css';

export default function Option(props) {
  const { data } = props;
  return (
    <components.Option {...props} className="user-detail">
      <div className="row">
        <img
          src={data.user.avatarUrl}
          alt={data.user.firstName}
          className="rounded-circle user-image"
          width={30}
          height={30}
        />

        <h6 className="user-label">
          {data.user.firstName} {data.user.lastName}
        </h6>
      </div>
    </components.Option>
  );
}

Option.propTypes = {
  data: PropTypes.shape({
    user: PropTypes.shape({
      userId: PropTypes.number,
      avatarUrl: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
  }),
};
