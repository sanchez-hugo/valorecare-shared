using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Domain.Job;
using Sabio.Models.Domain.LookUp;
using Sabio.Models.Requests.Job;
using Sabio.Models.Requests.Locations;

namespace Sabio.Services
{
    public class JobService : IJobService
    {
        IDataProvider _data = null;
        public JobService(IDataProvider data)
        {
            _data = data;
        }
        public int Add(JobAddRequest request, int userId)
        {
            string procName = "[dbo].[Jobs_Insert_V2]";
            int id = 0;

            _data.ExecuteNonQuery(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    JobAddInputs(request, inputCollection);
                    inputCollection.AddWithValue("@CreatedBy", userId);

                    SqlParameter outputId = new SqlParameter("@Id", SqlDbType.Int);
                    outputId.Direction = ParameterDirection.Output;
                    inputCollection.Add(outputId);
                },
                delegate (SqlParameterCollection returnCollection)
                {
                    object outputOfId = returnCollection["@Id"].Value;
                    int.TryParse(outputOfId.ToString(), out id);
                }
            );

            return id;
        }
        public Paged<Job> Get(int PageIndex, int PageSize)
        {
            Paged<Job> pagedList = null;
            List<Job> list = null;
            int totalCount = 0;
            LastColumn = 0;

            string procName = "[dbo].[Jobs_SelectAll]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@PageIndex", PageIndex);
                    inputCollection.AddWithValue("@PageSize", PageSize);
                },
                delegate (IDataReader reader, short set)
                {

                    Job job = MapJob(reader);
                    if (totalCount == 0)
                        totalCount = reader.GetSafeInt32(LastColumn);

                    if (list == null)
                        list = new List<Job>();
                    list.Add(job);
                }
                );

            if (list != null)
                pagedList = new Paged<Job>(list, PageIndex, PageSize, totalCount);

            return pagedList;
        }
        public Paged<Job> GetByCreatedBy(int PageIndex, int PageSize, int CreatedBy)
        {
            Paged<Job> pagedList = null;
            List<Job> list = null;
            int totalCount = 0;
            LastColumn = 0;

            string procName = "[dbo].[Jobs_SelectByCreatedBy]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@PageIndex", PageIndex);
                    inputCollection.AddWithValue("@PageSize", PageSize);
                    inputCollection.AddWithValue("@CreatedBy", CreatedBy);
                },
                delegate (IDataReader reader, short set)
                {

                    Job job = MapJob(reader);
                    if (totalCount == 0)
                        totalCount = reader.GetSafeInt32(LastColumn);

                    if (list == null)
                        list = new List<Job>();
                    list.Add(job);
                }
                );

            if (list != null)
                pagedList = new Paged<Job>(list, PageIndex, PageSize, totalCount);

            return pagedList;
        }
        public Paged<Job> SearchByCreatedBy(string Query, int PageIndex, int PageSize, int CreatedBy)
        {
            Paged<Job> pagedList = null;
            List<Job> list = null;
            int totalCount = 0;
            LastColumn = 0;

            string procName = "[dbo].[Jobs_SearchPaginated_ByCreatedBy]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@PageIndex", PageIndex);
                    inputCollection.AddWithValue("@PageSize", PageSize);
                    inputCollection.AddWithValue("@Query", Query);
                    inputCollection.AddWithValue("@CreatedBy", CreatedBy);
                },
                delegate (IDataReader reader, short set)
                {

                    Job job = MapJob(reader);
                    if (totalCount == 0)
                        totalCount = reader.GetSafeInt32(LastColumn);

                    if (list == null)
                        list = new List<Job>();
                    list.Add(job);
                }
                );

            if (list != null)
                pagedList = new Paged<Job>(list, PageIndex, PageSize, totalCount);

            return pagedList;
        }
        public Paged<JobWithDistance> SearchNearby(string Query, int PageIndex, int PageSize, double Radius, string Zip)
        {
            Paged<JobWithDistance> pagedList = null;
            List<JobWithDistance> list = null;
            int totalCount = 0;
            LastColumn = 0;

            string procName = "[dbo].[Jobs_SearchPaginated_ByZip]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@PageIndex", PageIndex);
                    inputCollection.AddWithValue("@PageSize", PageSize);
                    inputCollection.AddWithValue("@Query", Query);
                    inputCollection.AddWithValue("@Radius", Radius);
                    inputCollection.AddWithValue("@Zip", Zip);
                },
                delegate (IDataReader reader, short set)
                {

                    JobWithDistance job = MapJobWithDistance(reader);
                    if (totalCount == 0)
                        totalCount = reader.GetSafeInt32(LastColumn);

                    if (list == null)
                        list = new List<JobWithDistance>();
                    list.Add(job);
                }
                );

            if (list != null)
                pagedList = new Paged<JobWithDistance>(list, PageIndex, PageSize, totalCount);

            return pagedList;
        }
        public Paged<JobWithDistance> GetNearby(int PageIndex, int PageSize, double Radius, string Zip)
        {
            Paged<JobWithDistance> pagedList = null;
            List<JobWithDistance> list = null;
            int totalCount = 0;
            LastColumn = 0;

            string procName = "[dbo].[Jobs_SearchPaginated_ByZip_V2]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@PageIndex", PageIndex);
                    inputCollection.AddWithValue("@PageSize", PageSize);
                    inputCollection.AddWithValue("@Radius", Radius);
                    inputCollection.AddWithValue("@Zip", Zip);
                },
                delegate (IDataReader reader, short set)
                {

                    JobWithDistance job = MapJobWithDistance(reader);
                    if (totalCount == 0)
                        totalCount = reader.GetSafeInt32(LastColumn);

                    if (list == null)
                        list = new List<JobWithDistance>();
                    list.Add(job);
                }
                );

            if (list != null)
                pagedList = new Paged<JobWithDistance>(list, PageIndex, PageSize, totalCount);

            return pagedList;
        }
        public Job GetById(int Id)
        {
            Job job = null;

            string procName = "[dbo].[Jobs_SelectById]";

            _data.ExecuteCmd(procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@Id", Id);
                },
                delegate (IDataReader reader, short set)
                {
                    job = MapJob(reader);
                }
                );

            return job;
        }
        public void Update(JobUpdateRequest request, int userId)
        {
            string procname = "[dbo].[Jobs_Update_V2]";

            _data.ExecuteNonQuery(procname
             , delegate (SqlParameterCollection inputCollection)
             {
                 JobAddInputs(request, inputCollection);
                 inputCollection.AddWithValue("@Id", request.Id);
                 inputCollection.AddWithValue("@UserId", userId);
             }, null
             );
        }


        public void Delete(int Id)
        {
            string procname = "[dbo].[Jobs_DeleteById]";

            _data.ExecuteNonQuery(procname
             , delegate (SqlParameterCollection inputCollection)
             {
                 inputCollection.AddWithValue("@Id", Id);
             }, null
             );
        }

        private static int LastColumn = 0;
        private static Job MapJob(IDataReader reader)
        {

            int indexCounter = 0;
            Job job = new Job();
            job.Id = reader.GetSafeInt32(indexCounter++);

            #region Created By
            job.CreatedBy = new BaseUserProfile();
            job.CreatedBy.UserId = reader.GetSafeInt32(indexCounter++);
            job.CreatedBy.FirstName = reader.GetSafeString(indexCounter++);
            job.CreatedBy.LastName = reader.GetSafeString(indexCounter++);
            job.CreatedBy.Mi = reader.GetSafeString(indexCounter++);
            job.CreatedBy.AvatarUrl = reader.GetSafeString(indexCounter++);
            #endregion

            #region Job Type
            job.JobType = new TwoColumn();
            job.JobType.Id = reader.GetSafeInt32(indexCounter++);
            job.JobType.Name = reader.GetSafeString(indexCounter++);
            #endregion

            #region Job Location
            job.JobLocation = new Location();
            job.JobLocation.Id = reader.GetSafeInt32(indexCounter++);

            job.JobLocation.LocationType = new TwoColumn();
            job.JobLocation.LocationType.Id = reader.GetSafeInt32(indexCounter++);
            job.JobLocation.LocationType.Name = reader.GetSafeString(indexCounter++);

            job.JobLocation.LineOne = reader.GetSafeString(indexCounter++);
            job.JobLocation.LineTwo = reader.GetSafeString(indexCounter++);
            job.JobLocation.City = reader.GetSafeString(indexCounter++);
            job.JobLocation.Zip = reader.GetSafeString(indexCounter++);

            job.JobLocation.State = new TwoColumn();
            job.JobLocation.State.Id = reader.GetSafeInt32(indexCounter++);
            job.JobLocation.State.Name = reader.GetSafeString(indexCounter++);

            job.JobLocation.Latitude = reader.GetSafeDouble(indexCounter++);
            job.JobLocation.Longitude = reader.GetSafeDouble(indexCounter++);
            job.JobLocation.DateAdded = reader.GetSafeDateTime(indexCounter++);
            job.JobLocation.DateModified = reader.GetSafeDateTime(indexCounter++);

            job.JobLocation.CreatedBy = new BaseUserProfile();
            job.JobLocation.CreatedBy.UserId = reader.GetSafeInt32(indexCounter++);
            job.JobLocation.CreatedBy.FirstName = reader.GetSafeString(indexCounter++);
            job.JobLocation.CreatedBy.LastName = reader.GetSafeString(indexCounter++);
            #endregion

            job.Title = reader.GetSafeString(indexCounter++);
            job.Description = reader.GetSafeString(indexCounter++);
            job.Requirements = reader.GetSafeString(indexCounter++);
            job.IsActive = reader.GetSafeBool(indexCounter++);
            job.DateCreated = reader.GetSafeDateTime(indexCounter++);
            job.DateModified = reader.GetSafeDateTime(indexCounter++);

            if (LastColumn == 0)
                LastColumn = indexCounter;

            return job;
        }

        private static JobWithDistance MapJobWithDistance(IDataReader reader)
        {

            int indexCounter = 0;
            JobWithDistance job = new JobWithDistance();
            job.Id = reader.GetSafeInt32(indexCounter++);

            #region Created By
            job.CreatedBy = new BaseUserProfile();
            job.CreatedBy.UserId = reader.GetSafeInt32(indexCounter++);
            job.CreatedBy.FirstName = reader.GetSafeString(indexCounter++);
            job.CreatedBy.LastName = reader.GetSafeString(indexCounter++);
            job.CreatedBy.Mi = reader.GetSafeString(indexCounter++);
            job.CreatedBy.AvatarUrl = reader.GetSafeString(indexCounter++);
            #endregion

            #region Job Type
            job.JobType = new TwoColumn();
            job.JobType.Id = reader.GetSafeInt32(indexCounter++);
            job.JobType.Name = reader.GetSafeString(indexCounter++);
            #endregion

            #region Job Location
            job.JobLocation = new Location();
            job.JobLocation.Id = reader.GetSafeInt32(indexCounter++);

            job.JobLocation.LocationType = new TwoColumn();
            job.JobLocation.LocationType.Id = reader.GetSafeInt32(indexCounter++);
            job.JobLocation.LocationType.Name = reader.GetSafeString(indexCounter++);

            job.JobLocation.LineOne = reader.GetSafeString(indexCounter++);
            job.JobLocation.LineTwo = reader.GetSafeString(indexCounter++);
            job.JobLocation.City = reader.GetSafeString(indexCounter++);
            job.JobLocation.Zip = reader.GetSafeString(indexCounter++);

            job.JobLocation.State = new TwoColumn();
            job.JobLocation.State.Id = reader.GetSafeInt32(indexCounter++);
            job.JobLocation.State.Name = reader.GetSafeString(indexCounter++);

            job.JobLocation.Latitude = reader.GetSafeDouble(indexCounter++);
            job.JobLocation.Longitude = reader.GetSafeDouble(indexCounter++);
            job.JobLocation.DateAdded = reader.GetSafeDateTime(indexCounter++);
            job.JobLocation.DateModified = reader.GetSafeDateTime(indexCounter++);

            job.JobLocation.CreatedBy = new BaseUserProfile();
            job.JobLocation.CreatedBy.UserId = reader.GetSafeInt32(indexCounter++);
            job.JobLocation.CreatedBy.FirstName = reader.GetSafeString(indexCounter++);
            job.JobLocation.CreatedBy.LastName = reader.GetSafeString(indexCounter++);
            #endregion

            job.Title = reader.GetSafeString(indexCounter++);
            job.Description = reader.GetSafeString(indexCounter++);
            job.Requirements = reader.GetSafeString(indexCounter++);
            job.IsActive = reader.GetSafeBool(indexCounter++);
            job.DateCreated = reader.GetSafeDateTime(indexCounter++);
            job.DateModified = reader.GetSafeDateTime(indexCounter++);
            job.Distance = reader.GetSafeDouble(indexCounter++);

            if (LastColumn == 0)
                LastColumn = indexCounter;

            return job;
        }
        private static void JobAddInputs(JobAddRequest request, SqlParameterCollection inputCollection)
        {
            inputCollection.AddWithValue("@JobTypeId", request.JobTypeId);
            inputCollection.AddWithValue("@LocationId", request.locationId);
            inputCollection.AddWithValue("@Title", request.Title);
            inputCollection.AddWithValue("@Description", request.Description);
            inputCollection.AddWithValue("@Requirements", request.Requirements);
            inputCollection.AddWithValue("@IsActive", request.IsActive);
            //Location
            if (request.locationId > 0)
            {
                request.Location = new LocationAddRequest();
            }
            inputCollection.AddWithValue("@LocationTypeId", request.Location.LocationTypeId);
            inputCollection.AddWithValue("@LineOne", request.Location.LineOne);
            inputCollection.AddWithValue("@LineTwo", request.Location.LineTwo);
            inputCollection.AddWithValue("@City", request.Location.City);
            inputCollection.AddWithValue("@Zip", request.Location.Zip);
            inputCollection.AddWithValue("@StateId", request.Location.StateId);
            inputCollection.AddWithValue("@Latitude", request.Location.Latitude);
            inputCollection.AddWithValue("@Longitude", request.Location.Longitude);

        }
    }
}
