using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests.Appointments;
using Sabio.Models.Requests.ScheduleAvailbility;
using System;
using System.Collections.Generic;
using System.Text;

namespace Sabio.Services.Interfaces
{
   public interface IAppointmentService
    {
        Appointment Get(int id);
        Appointment GetAppointmentForEmail(int appointmentId);
        Paged<Appointment> GetSeekerAppointments(int seekerId, int pageIndex, int pageSize);
        Paged<Appointment> GetProviderAppointments(int providerId, int pageIndex, int pageSize);
        Paged<Appointment> GetSeekerConfirmedAppointments(int seekerId, int pageIndex, int pageSize);
        Paged<Appointment> GetSeekerCancelledAppointments(int seekerId, int pageIndex, int pageSize);
        Paged<Appointment> GetProviderConfirmedAppointments(int providerId, int pageIndex, int pageSize);
        Paged<Appointment> GetProviderCancelledAppointments(int providerId, int pageIndex, int pageSize);

        #region C-UD
        int Add(AppointmentAddRequest model, int userId);
        void Update(AppointmentUpdateRequest model, int userId);
        void Delete(int id);
        #endregion

        #region Non-Appointment
        ScheduleAvailablityByDate GetAvailability(int userId, DateTime scheduleDate);
        string GetEmail(int id);
        Paged<Appointment> SelectProviderBySeekerId(int seekerId, int pageIndex, int pageSize);
        List<BaseUserProfile> GetUsersByProvider(int providerId);
        List<BaseUserProfile> GetUsersBySeeker(int seekerId);
        Paged<Appointment> GetProviderUserAppointments(int providerId, int seekerId, int pageIndex, int pageSize);
        Paged<Appointment> GetSeekerUserAppointments(int seekerId, int providerId, int pageIndex, int pageSize);
        #endregion
    }
}
