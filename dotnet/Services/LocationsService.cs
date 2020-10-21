using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Domain.Coordinates;
using Sabio.Models.Domain.LookUp;
using Sabio.Models.Requests;
using Sabio.Models.Requests.Locations;
using Sabio.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace Sabio.Services
{
    public class LocationsService : ILocationsService
    {
        IDataProvider _data = null;
        public LocationsService(IDataProvider data)
        {
            _data = data;
        }
        public void Update(LocationUpdateRequest model, int userId)
        {
            string procName = "[dbo].[Locations_Update]";
            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
            {
                AddCommonParams(model, col);
                col.AddWithValue("@ModifiedBy", userId);

                col.AddWithValue("@Id", model.Id);
            },
            returnParameters: null);
        }
        public int Create(LocationAddRequest model, int userId)
        {
            int id = 0;

            string procName = "[dbo].[Locations_Insert]";
            _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                AddCommonParams(model, col);
                col.AddWithValue("@CreatedBy", userId);


                SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                idOut.Direction = ParameterDirection.Output;

                col.Add(idOut);

            }, returnParameters: delegate (SqlParameterCollection returnCollection)
            {
                object oId = returnCollection["@Id"].Value;

                int.TryParse(oId.ToString(), out id);

                Console.WriteLine("");
            });

            return id;
        }
        public Location Get(int id)
        {
            string procName = "[dbo].[Locations_SelectById]";

            Location location = null;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@Id", id);

            }, delegate (IDataReader reader, short set)
            {
                int startingIndex = 0;
                location = MapLocation(reader, out startingIndex );
            });
            return location;

        }
        public Paged<Location> Pagination(int pageIndex, int pageSize)
        {
            Paged<Location> pagedList = null;
            List<Location> list = null;
            int totalCount = 0;
            int startingIndex = 0;


            _data.ExecuteCmd("[dbo].[Locations_SelectAll]", inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@PageIndex", pageIndex);
                parameterCollection.AddWithValue("@PageSize", pageSize);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                Location location = MapLocation(reader, out startingIndex);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(startingIndex++);
                }
                if (list == null)
                {
                    list = new List<Location>();
                }

                list.Add(location);
            }
            );
            if (list != null)
            {
                pagedList = new Paged<Location>(list, pageIndex, pageSize, totalCount);
            }


            return pagedList;
        }

        public Paged<Location> Search(int pageIndex, int pageSize, string query)
        {
            Paged<Location> pagedList = null;
            List<Location> list = null;
            int totalCount = 0;
            int startingIndex = 0;


            _data.ExecuteCmd("[dbo].[Locations_Search]", inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@Query", query);
                parameterCollection.AddWithValue("@PageSize", pageSize);
                parameterCollection.AddWithValue("@PageIndex", pageIndex);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                Location location = MapLocation(reader, out startingIndex);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(startingIndex++);
                }
                if (list == null)
                {
                    list = new List<Location>();
                }

                list.Add(location);
            }
            );
            if (list != null)
            {
                pagedList = new Paged<Location>(list, pageIndex, pageSize, totalCount);
            }


            return pagedList;
        }
        public Paged<Location> PagedCreate(int pageIndex, int pageSize, int userId)
        {
            Paged<Location> pagedList = null;
            List<Location> list = null;
            int totalCount = 0;


            _data.ExecuteCmd("[dbo].[Locations_SelectByCreatedBy]", inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                
                parameterCollection.AddWithValue("@CreatedBy", userId);
                parameterCollection.AddWithValue("@PageIndex", pageIndex);
                parameterCollection.AddWithValue("@PageSize", pageSize);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int startingIndex = 0;
                Location location = MapLocation(reader, out startingIndex);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(startingIndex++);
                }
                if (list == null)
                {
                    list = new List<Location>();
                }

                list.Add(location);
            }
            );
            if (list != null)
            {
                pagedList = new Paged<Location>(list, pageIndex, pageSize, totalCount);
            }


            return pagedList;
        }
        public Paged<Location> PagedGeo(int Latitude, int Longitude, int Radius)
        {
            Paged<Location> pagedList = null;
            List<Location> list = null;
            int radius = 0;
            int totalCount = 0;
      

            _data.ExecuteCmd("[dbo].[Locations_SelectByGeo]", inputParamMapper: delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@Latitude", Latitude);
                parameterCollection.AddWithValue("@Longitude", Longitude);
                parameterCollection.AddWithValue("@Radius", Radius);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int startingIndex = 0;
                Location location = MapLocation(reader, out startingIndex);
                if (totalCount == 0)
                {
                    totalCount = reader.GetSafeInt32(startingIndex++);
                }
                if (list == null)
                {
                    list = new List<Location>();
                }

                list.Add(location);
            }
            );
            if (list != null)
            {
                pagedList = new Paged<Location>(list, Latitude, Longitude, radius);
            }


            return pagedList;
        }
        public void Delete(int id)
        {
            string procName = "[dbo].[Locations_DeleteById]";
            _data.ExecuteNonQuery(procName,
            inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@Id", id);
            },
            returnParameters: null);
        }



        private static Location MapLocation(IDataReader reader, out int startingIndex)
        {
            Location aLocation = new Location();
            startingIndex = 0;
            aLocation.Id = reader.GetSafeInt32(startingIndex++);

            aLocation.LocationType = new TwoColumn();
            aLocation.LocationType.Id = reader.GetSafeInt32(startingIndex++);
            aLocation.LocationType.Name = reader.GetSafeString(startingIndex++);

            aLocation.LineOne = reader.GetSafeString(startingIndex++);
            aLocation.LineTwo = reader.GetSafeString(startingIndex++);
            aLocation.City = reader.GetSafeString(startingIndex++);
            aLocation.Zip = reader.GetSafeString(startingIndex++);

            aLocation.State = new TwoColumn();
            aLocation.State.Id = reader.GetSafeInt32(startingIndex++);
            aLocation.State.Name = reader.GetSafeString(startingIndex++);

            aLocation.Latitude = reader.GetSafeDouble(startingIndex++);
            aLocation.Longitude = reader.GetSafeDouble(startingIndex++);
            aLocation.DateModified = reader.GetSafeDateTime(startingIndex++);
            aLocation.DateAdded = reader.GetSafeDateTime(startingIndex++);
            aLocation.CreatedBy = new BaseUserProfile();
            aLocation.CreatedBy.UserId = reader.GetSafeInt32(startingIndex++);
            aLocation.CreatedBy.FirstName = reader.GetSafeString(startingIndex++);
            aLocation.CreatedBy.LastName = reader.GetSafeString(startingIndex++);
            return aLocation;
        }
        private static void AddCommonParams(LocationAddRequest model, SqlParameterCollection col)
        {
            col.AddWithValue("@LocationTypeId", model.LocationTypeId);
            col.AddWithValue("@LineOne", model.LineOne);
            col.AddWithValue("@LineTwo", model.LineTwo);
            col.AddWithValue("@City", model.City);
            col.AddWithValue("@Zip", model.Zip);
            col.AddWithValue("@StateId", model.StateId);
            col.AddWithValue("@Latitude", model.Latitude);
            col.AddWithValue("@Longitude", model.Longitude);

        }

        public Coordinates GetByZip(string zip)
        {
            Coordinates item = new Coordinates();
            string procName = "[dbo].[GetLatLongByZipCode]";

            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection inputCollection)
            {
                inputCollection.AddWithValue("@Zip", zip);
            }
            , singleRecordMapper: delegate (IDataReader reader, short set)
            {

                int index = 0;
                item.City = reader.GetSafeString(index++);
                item.State = reader.GetSafeString(index++);
                item.Latitude = reader.GetSafeDouble(index++);
                item.Longitude = reader.GetSafeDouble(index++);

            }
           );

            return item;
        }

    }
}

