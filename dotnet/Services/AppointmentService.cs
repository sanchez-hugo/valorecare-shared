using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests.Appointments;
using Sabio.Models.Requests.ScheduleAvailbility;
using Sabio.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;


namespace Sabio.Services
{
    public class AppointmentService : IAppointmentService
    {
        IDataProvider _data = null;

        public AppointmentService(IDataProvider data)
        {
            _data = data;
        }
        public Appointment Get(int id)
        {
            string procName = "[dbo].[Appointments_SelectById_V2]";

            Appointment appointment = null;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramcollection)
            {
                paramcollection.AddWithValue("@Id", id);

            }, delegate (IDataReader reader, short set)
            {
                int startingIndex;
                appointment = MapAppointment(reader, out appointment, out startingIndex);

            }
            );
            return appointment;



        }

        #region Provider Appointments
        public Paged<Appointment> GetProviderAppointments(int providerId, int pageIndex, int pageSize)
        {
            Paged<Appointment> pagedAppointments = null;
            List<Appointment> appointments = null;
            int totalCount = 0;

            _data.ExecuteCmd(
              "[dbo].[Appointments_SelectByProviderId_Paginated]",
              inputParamMapper: delegate (SqlParameterCollection parameterCollection)
              {
                  parameterCollection.AddWithValue("@providerId", providerId);
                  parameterCollection.AddWithValue("@pageIndex", pageIndex);
                  parameterCollection.AddWithValue("@pageSize", pageSize);
              },
              singleRecordMapper: delegate (IDataReader reader, short set)
              {
                  Appointment appointment;
                  int startingIndex;
                  MapAppointment(reader, out appointment, out startingIndex);

                  if (totalCount == 0)
                  {
                      totalCount = reader.GetSafeInt32(startingIndex++);
                  }
                  if (appointments == null)
                  {
                      appointments = new List<Appointment>();
                  }
                  appointments.Add(appointment);
              }
          );
            if (appointments != null)
            {
                pagedAppointments = new Paged<Appointment>(appointments, pageIndex, pageSize, totalCount);
            }

            return pagedAppointments;
        }
        public Paged<Appointment> GetProviderConfirmedAppointments(int providerId, int pageIndex, int pageSize)
        {
            Paged<Appointment> pagedAppointments = null;
            List<Appointment> appointments = null;
            int totalCount = 0;

            _data.ExecuteCmd(
              "[dbo].[Appointments_SelectByProviderId_Confirmed]",
              inputParamMapper: delegate (SqlParameterCollection parameterCollection)
              {
                  parameterCollection.AddWithValue("@providerId", providerId);
                  parameterCollection.AddWithValue("@pageIndex", pageIndex);
                  parameterCollection.AddWithValue("@pageSize", pageSize);
              },
              singleRecordMapper: delegate (IDataReader reader, short set)
              {
                  Appointment appointment;
                  int startingIndex;
                  MapAppointment(reader, out appointment, out startingIndex);

                  if (totalCount == 0)
                  {
                      totalCount = reader.GetSafeInt32(startingIndex++);
                  }
                  if (appointments == null)
                  {
                      appointments = new List<Appointment>();
                  }
                  appointments.Add(appointment);
              }
          );
            if (appointments != null)
            {
                pagedAppointments = new Paged<Appointment>(appointments, pageIndex, pageSize, totalCount);
            }

            return pagedAppointments;
        }
        public Paged<Appointment> GetProviderCancelledAppointments(int providerId, int pageIndex, int pageSize)
        {
            Paged<Appointment> pagedAppointments = null;
            List<Appointment> appointments = null;
            int totalCount = 0;

            _data.ExecuteCmd(
              "[dbo].[Appointments_SelectByProviderId_Cancelled]",
              inputParamMapper: delegate (SqlParameterCollection parameterCollection)
              {
                  parameterCollection.AddWithValue("@providerId", providerId);
                  parameterCollection.AddWithValue("@pageIndex", pageIndex);
                  parameterCollection.AddWithValue("@pageSize", pageSize);
              },
              singleRecordMapper: delegate (IDataReader reader, short set)
              {
                  Appointment appointment;
                  int startingIndex;
                  MapAppointment(reader, out appointment, out startingIndex);

                  if (totalCount == 0)
                  {
                      totalCount = reader.GetSafeInt32(startingIndex++);
                  }
                  if (appointments == null)
                  {
                      appointments = new List<Appointment>();
                  }
                  appointments.Add(appointment);
              }
          );
            if (appointments != null)
            {
                pagedAppointments = new Paged<Appointment>(appointments, pageIndex, pageSize, totalCount);
            }

            return pagedAppointments;
        }
        public List<BaseUserProfile> GetUsersByProvider(int providerId)
        {
            string procName = "[dbo].[Appointments_GetSeekersNameBy_ProviderId]";

            List<BaseUserProfile> listOfSeekers = null;

            _data.ExecuteCmd(procName,
                (param) =>
                {
                    param.AddWithValue("@ProviderId", providerId);
                },
                (reader, recordSetIndex) =>
                {
                    BaseUserProfile seeker = new BaseUserProfile();
                    int startingIndex = 0;

                    seeker.UserId = reader.GetSafeInt32(startingIndex++);
                    seeker.FirstName = reader.GetSafeString(startingIndex++);
                    seeker.LastName = reader.GetSafeString(startingIndex++);

                    if (listOfSeekers == null)
                    {
                        listOfSeekers = new List<BaseUserProfile>();
                    }
                    listOfSeekers.Add(seeker);
                });

            return listOfSeekers;
        }
        public Paged<Appointment> GetProviderUserAppointments(int providerId, int seekerId, int pageIndex, int pageSize)
        {
            Paged<Appointment> pagedAppointments = null;
            List<Appointment> appointments = null;
            int totalCount = 0;

            _data.ExecuteCmd(
              "[dbo].[Appointments_SelectByProviderId_Users]",
              inputParamMapper: delegate (SqlParameterCollection parameterCollection)
              {
                  parameterCollection.AddWithValue("@providerId", providerId);
                  parameterCollection.AddWithValue("@seekerId", seekerId);
                  parameterCollection.AddWithValue("@pageIndex", pageIndex);
                  parameterCollection.AddWithValue("@pageSize", pageSize);
              },
              singleRecordMapper: delegate (IDataReader reader, short set)
              {
                  Appointment appointment;
                  int startingIndex;
                  MapAppointment(reader, out appointment, out startingIndex);

                  if (totalCount == 0)
                  {
                      totalCount = reader.GetSafeInt32(startingIndex++);
                  }
                  if (appointments == null)
                  {
                      appointments = new List<Appointment>();
                  }
                  appointments.Add(appointment);
              }
          );
            if (appointments != null)
            {
                pagedAppointments = new Paged<Appointment>(appointments, pageIndex, pageSize, totalCount);
            }

            return pagedAppointments;
        }
        #endregion

        #region Seeker Appointments
        public Paged<Appointment> GetSeekerAppointments(int seekerId, int pageIndex, int pageSize)
        {
            Paged<Appointment> pagedAppointments = null;
            List<Appointment> appointments = null;
            int totalCount = 0;

            _data.ExecuteCmd(
              "[dbo].[Appointments_SelectBySeekerId_Paginated]",
              inputParamMapper: delegate (SqlParameterCollection parameterCollection)
              {
                  parameterCollection.AddWithValue("@seekerId", seekerId);
                  parameterCollection.AddWithValue("@pageIndex", pageIndex);
                  parameterCollection.AddWithValue("@pageSize", pageSize);
              },
              singleRecordMapper: delegate (IDataReader reader, short set)
              {
                  Appointment appointment;
                  int startingIndex;
                  MapAppointment(reader, out appointment, out startingIndex);

                  if (totalCount == 0)
                  {
                      totalCount = reader.GetSafeInt32(startingIndex++);
                  }
                  if (appointments == null)
                  {
                      appointments = new List<Appointment>();
                  }
                  appointments.Add(appointment);
              }
          );
            if (appointments != null)
            {
                pagedAppointments = new Paged<Appointment>(appointments, pageIndex, pageSize, totalCount);
            }

            return pagedAppointments;
        }
        public Paged<Appointment> GetSeekerConfirmedAppointments(int seekerId, int pageIndex, int pageSize)
        {
            Paged<Appointment> pagedAppointments = null;
            List<Appointment> appointments = null;
            int totalCount = 0;

            _data.ExecuteCmd(
              "[dbo].[Appointments_SelectBySeekerId_Confirmed]",
              inputParamMapper: delegate (SqlParameterCollection parameterCollection)
              {
                  parameterCollection.AddWithValue("@seekerId", seekerId);
                  parameterCollection.AddWithValue("@pageIndex", pageIndex);
                  parameterCollection.AddWithValue("@pageSize", pageSize);
              },
              singleRecordMapper: delegate (IDataReader reader, short set)
              {
                  Appointment appointment;
                  int startingIndex;
                  MapAppointment(reader, out appointment, out startingIndex);

                  if (totalCount == 0)
                  {
                      totalCount = reader.GetSafeInt32(startingIndex++);
                  }
                  if (appointments == null)
                  {
                      appointments = new List<Appointment>();
                  }
                  appointments.Add(appointment);
              }
          );
            if (appointments != null)
            {
                pagedAppointments = new Paged<Appointment>(appointments, pageIndex, pageSize, totalCount);
            }

            return pagedAppointments;
        }
        public Paged<Appointment> GetSeekerCancelledAppointments(int seekerId, int pageIndex, int pageSize)
        {
            Paged<Appointment> pagedAppointments = null;
            List<Appointment> appointments = null;
            int totalCount = 0;

            _data.ExecuteCmd(
              "[dbo].[Appointments_SelectBySeekerId_Cancelled]",
              inputParamMapper: delegate (SqlParameterCollection parameterCollection)
              {
                  parameterCollection.AddWithValue("@seekerId", seekerId);
                  parameterCollection.AddWithValue("@pageIndex", pageIndex);
                  parameterCollection.AddWithValue("@pageSize", pageSize);
              },
              singleRecordMapper: delegate (IDataReader reader, short set)
              {
                  Appointment appointment;
                  int startingIndex;
                  MapAppointment(reader, out appointment, out startingIndex);

                  if (totalCount == 0)
                  {
                      totalCount = reader.GetSafeInt32(startingIndex++);
                  }
                  if (appointments == null)
                  {
                      appointments = new List<Appointment>();
                  }
                  appointments.Add(appointment);
              }
          );
            if (appointments != null)
            {
                pagedAppointments = new Paged<Appointment>(appointments, pageIndex, pageSize, totalCount);
            }

            return pagedAppointments;
        }
        public List<BaseUserProfile> GetUsersBySeeker(int seekerId)
        {
            string procName = "[dbo].[Appointments_GetProvidersNameBy_SeekerId]";

            List<BaseUserProfile> listOfProviders = null;

            _data.ExecuteCmd(procName,
                (param) =>
                {
                    param.AddWithValue("@SeekerId", seekerId);
                },
                (reader, recordSetIndex) =>
                {
                    BaseUserProfile provider = new BaseUserProfile();
                    int startingIndex = 0;

                    provider.UserId = reader.GetSafeInt32(startingIndex++);
                    provider.FirstName = reader.GetSafeString(startingIndex++);
                    provider.LastName = reader.GetSafeString(startingIndex++);

                    if (listOfProviders == null)
                    {
                        listOfProviders = new List<BaseUserProfile>();
                    }
                    listOfProviders.Add(provider);
                });

            return listOfProviders;
        }
        public Paged<Appointment> GetSeekerUserAppointments(int seekerId, int providerId, int pageIndex, int pageSize)
        {
            Paged<Appointment> pagedAppointments = null;
            List<Appointment> appointments = null;
            int totalCount = 0;

            _data.ExecuteCmd(
              "[dbo].[Appointments_SelectByProviderId_Users]",
              inputParamMapper: delegate (SqlParameterCollection parameterCollection)
              {
                  parameterCollection.AddWithValue("@seekerId", seekerId);
                  parameterCollection.AddWithValue("@providerId", providerId);
                  parameterCollection.AddWithValue("@pageIndex", pageIndex);
                  parameterCollection.AddWithValue("@pageSize", pageSize);
              },
              singleRecordMapper: delegate (IDataReader reader, short set)
              {
                  Appointment appointment;
                  int startingIndex;
                  MapAppointment(reader, out appointment, out startingIndex);

                  if (totalCount == 0)
                  {
                      totalCount = reader.GetSafeInt32(startingIndex++);
                  }
                  if (appointments == null)
                  {
                      appointments = new List<Appointment>();
                  }
                  appointments.Add(appointment);
              }
          );
            if (appointments != null)
            {
                pagedAppointments = new Paged<Appointment>(appointments, pageIndex, pageSize, totalCount);
            }

            return pagedAppointments;
        }
        #endregion

        #region C-UD
        public int Add(AppointmentAddRequest model, int userId)
        {

            int id = 0;

            string procName = "[dbo].[Appointments_Insert_V2]";
            _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                ColSeekerAddParams(model, col, userId);


                SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                idOut.Direction = ParameterDirection.Output;

                col.Add(idOut);


            }, returnParameters: delegate (SqlParameterCollection returnCollection)
            {
                object oId = returnCollection["@Id"].Value;
                int.TryParse(oId.ToString(), out id);
            });
            return id;
        }
        public void Update(AppointmentUpdateRequest model, int userId)
        {
            string procName = "[dbo].[Appointments_Update_V2]";
            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    ColAddParams(model, col, userId);
                    col.AddWithValue("@Id", model.Id);
                },
                returnParameters: null);

        }
        public void Delete(int id)
        {
            string procName = "[dbo].[Appointments_DeleteById]";
            _data.ExecuteNonQuery(procName,
           inputParamMapper: delegate (SqlParameterCollection col)
           {
               col.AddWithValue("@Id", id);
           },
           returnParameters: null);
        }
        #endregion

        #region Non-Appointment
        public ScheduleAvailablityByDate GetAvailability(int userId, DateTime scheduleDate)
        {
            string procName = "[dbo].[ScheduleAvailability_SelectByDate]";
            ScheduleAvailablityByDate schedule = null;

            _data.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@ProviderId", userId);
                col.AddWithValue("@Date", scheduleDate);
            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                schedule = new ScheduleAvailablityByDate();
                int startingIndex = 0;

                schedule.ProviderId = reader.GetSafeInt32(startingIndex++);
                schedule.DayOfWeek = reader.GetSafeInt32(startingIndex++);
                schedule.ScheduleAvailability = reader.DeserializeObject<List<ScheduleAvailabilityTime>>(startingIndex++);
                schedule.Appointments = reader.DeserializeObject<List<AppointmentTime>>(startingIndex++);

            });
            return schedule;
        }
        public string GetEmail(int id)
        {
            string procName = "[dbo].[Users_Email_ById]";

            string email = null;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramcollection)
            {
                paramcollection.AddWithValue("@Id", id);

            }, delegate (IDataReader reader, short set)
            {
                email = reader.GetSafeString(0);
            }
            );
            return email;

        }
        public Paged<Appointment> SelectProviderBySeekerId(int seekerId, int pageIndex, int pageSize)
        {
            Paged<Appointment> pagedAppointments = null;
            List<Appointment> appointments = null;
            int totalCount = 0;

            _data.ExecuteCmd(
              "dbo.Appointments_SelectSeekerById_V5",
              inputParamMapper: delegate (SqlParameterCollection parameterCollection)
              {
                  parameterCollection.AddWithValue("@seekerId", seekerId);
                  parameterCollection.AddWithValue("@pageIndex", pageIndex);
                  parameterCollection.AddWithValue("@pageSize", pageSize);
              },
              singleRecordMapper: delegate (IDataReader reader, short set)
              {
                  Appointment appointment;
                  int startingIndex;
                  MapAppointment(reader, out appointment, out startingIndex);

                  if (totalCount == 0)
                  {
                      totalCount = reader.GetSafeInt32(startingIndex++);
                  }
                  if (appointments == null)
                  {
                      appointments = new List<Appointment>();
                  }
                  appointments.Add(appointment);
              }
          );
            if (appointments != null)
            {
                pagedAppointments = new Paged<Appointment>(appointments, pageIndex, pageSize, totalCount);
            }

            return pagedAppointments;

        }
        public Appointment GetAppointmentForEmail(int appointmentId)
        {
            string procName = "dbo.[Appointments_SelectById_V3]";

            Appointment appointment = null;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramcollection)
            {
                paramcollection.AddWithValue("@appointmentId", appointmentId);

            }, delegate (IDataReader reader, short set)
            {
                int startingIndex;
                appointment = MapFancyAppointmnet(reader, out appointment, out startingIndex);
            }
            );
            return appointment;

        }
        #endregion

        private static void ColAddParams(AppointmentAddRequest model, SqlParameterCollection col, int userId)
        {
            col.AddWithValue("@providerId", userId);
            col.AddWithValue("@seekerId", model.SeekerId);
            col.AddWithValue("@startTime", model.StartTime);
            col.AddWithValue("@endTime", model.EndTime);
            col.AddWithValue("@price", model.Price);
            col.AddWithValue("@isConfirmed", model.IsConfirmed);
            col.AddWithValue("@isCanceled", model.IsCancelled);
            col.AddWithValue("@CancellationReason", model.CancellationReason);
        }
        private static void ColSeekerAddParams(AppointmentAddRequest model, SqlParameterCollection col, int userId)
        {
            col.AddWithValue("@providerId", model.ProviderId);
            col.AddWithValue("@seekerId", userId);
            col.AddWithValue("@startTime", model.StartTime);
            col.AddWithValue("@endTime", model.EndTime);
            col.AddWithValue("@price", model.Price);
            col.AddWithValue("@isConfirmed", model.IsConfirmed);
            col.AddWithValue("@isCanceled", model.IsCancelled);
            col.AddWithValue("@CancellationReason", model.CancellationReason);
        }
        private static Appointment MapFancyAppointmnet(IDataReader reader, out Appointment singleAppointment, out int startingIndex)
        {
            singleAppointment = new Appointment();

            startingIndex = 0;

            UserProfile seeker = new UserProfile();
            UserProfile provider = new UserProfile();

            singleAppointment.Id = reader.GetSafeInt32(startingIndex++);

            provider.UserId = reader.GetSafeInt32(startingIndex++);
            provider.FirstName = reader.GetSafeString(startingIndex++);
            provider.LastName = reader.GetSafeString(startingIndex++);
            provider.Mi = reader.GetSafeString(startingIndex++);
            provider.AvatarUrl = reader.GetSafeString(startingIndex++);
            singleAppointment.ProviderEmail = reader.GetSafeString(startingIndex++);
            singleAppointment.Provider = provider;
            seeker.UserId = reader.GetSafeInt32(startingIndex++);
            seeker.FirstName = reader.GetSafeString(startingIndex++);
            seeker.LastName = reader.GetSafeString(startingIndex++);
            seeker.Mi = reader.GetSafeString(startingIndex++);
            seeker.AvatarUrl = reader.GetSafeString(startingIndex++);
            singleAppointment.SeekerEmail = reader.GetSafeString(startingIndex++);
            singleAppointment.Seeker = seeker;
            singleAppointment.StartTime = reader.GetSafeDateTime(startingIndex++);
            singleAppointment.EndTime = reader.GetSafeDateTime(startingIndex++);
            singleAppointment.Price = reader.GetSafeDecimal(startingIndex++);
            singleAppointment.IsConfirmed = reader.GetSafeBool(startingIndex++);
            singleAppointment.IsCancelled = reader.GetSafeBool(startingIndex++);
            singleAppointment.CancellationReason = reader.GetSafeString(startingIndex++);
            singleAppointment.DateCreated = reader.GetSafeDateTime(startingIndex++);
            singleAppointment.DateModified = reader.GetSafeDateTime(startingIndex++);

            return singleAppointment;
        }
        private static Appointment MapAppointment(IDataReader reader, out Appointment singleAppointment, out int startingIndex)
        {
            singleAppointment = new Appointment();

            startingIndex = 0;

            UserProfile seeker = new UserProfile();
            UserProfile provider = new UserProfile();

            singleAppointment.Id = reader.GetSafeInt32(startingIndex++);

            provider.UserId = reader.GetSafeInt32(startingIndex++);
            provider.FirstName = reader.GetSafeString(startingIndex++);
            provider.LastName = reader.GetSafeString(startingIndex++);
            provider.Mi = reader.GetSafeString(startingIndex++);
            provider.AvatarUrl = reader.GetSafeString(startingIndex++);
            singleAppointment.Provider = provider;
            seeker.UserId = reader.GetSafeInt32(startingIndex++);
            seeker.FirstName = reader.GetSafeString(startingIndex++);
            seeker.LastName = reader.GetSafeString(startingIndex++);
            seeker.Mi = reader.GetSafeString(startingIndex++);
            seeker.AvatarUrl = reader.GetSafeString(startingIndex++);
            singleAppointment.Seeker = seeker;
            singleAppointment.StartTime = reader.GetSafeDateTime(startingIndex++);
            singleAppointment.EndTime = reader.GetSafeDateTime(startingIndex++);
            singleAppointment.Price = reader.GetSafeDecimal(startingIndex++);
            singleAppointment.IsConfirmed = reader.GetSafeBool(startingIndex++);
            singleAppointment.IsCancelled = reader.GetSafeBool(startingIndex++);
            singleAppointment.CancellationReason = reader.GetSafeString(startingIndex++);
            singleAppointment.DateCreated = reader.GetSafeDateTime(startingIndex++);
            singleAppointment.DateModified = reader.GetSafeDateTime(startingIndex++);

            return singleAppointment;
        }
    }
}