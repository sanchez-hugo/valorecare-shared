using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Cryptography.Xml;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Requests;
using Sabio.Models.Requests.Appointments;
using Sabio.Models.Requests.ScheduleAvailbility;
using Sabio.Services;
using Sabio.Services.Interfaces;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;


namespace Sabio.Web.Api.Controllers
{
    [Route("api/appointments")]
    [ApiController]
    public class AppointmentApiController : BaseApiController
    {
        private IEmailService _emailService = null;
        private IAppointmentService _service = null;
        private IAuthenticationService<int> _authService = null;

        public AppointmentApiController(IAppointmentService service
            , ILogger<AppointmentApiController> logger
            , IAuthenticationService<int> authService
            , IEmailService emailService) : base(logger)

        {
            _service = service;
            _authService = authService;
            _emailService = emailService;
        }

        #region Provider Appointments
        [HttpGet("provider")]
        public ActionResult<ItemsResponse<Appointment>> GetProviderAppointments(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<Appointment> paged = _service.GetProviderAppointments(userId, pageIndex, pageSize);

                if (paged == null)
                {
                    code = 404;
                    response = new ErrorResponse("There are no appointments.");
                }
                else
                {
                    response = new ItemResponse<Paged<Appointment>> { Item = paged };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Server Error: {ex.Message}");
            }


            return StatusCode(code, response);

        }
        [HttpGet("provider/confirmed")]
        public ActionResult<ItemsResponse<Appointment>> GetProviderConfirmedAppointments(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<Appointment> paged = _service.GetProviderConfirmedAppointments(userId, pageIndex, pageSize);

                if (paged == null)
                {
                    code = 404;
                    response = new ErrorResponse("There are no confirmed appointments.");
                }
                else
                {
                    response = new ItemResponse<Paged<Appointment>> { Item = paged };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Server Error: {ex.Message}");
            }


            return StatusCode(code, response);

        }
        [HttpGet("provider/cancelled")]
        public ActionResult<ItemsResponse<Appointment>> GetProviderCancelledAppointments(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<Appointment> paged = _service.GetProviderCancelledAppointments(userId, pageIndex, pageSize);

                if (paged == null)
                {
                    code = 404;
                    response = new ErrorResponse("There are no cancelled appointments.");
                }
                else
                {
                    response = new ItemResponse<Paged<Appointment>> { Item = paged };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Server Error: {ex.Message}");
            }


            return StatusCode(code, response);

        }
        [HttpGet("provider/users")]
        public ActionResult<ItemsResponse<BaseUserProfile>> GetUsersByProvider()
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                List<BaseUserProfile> list = _service.GetUsersByProvider(userId);
                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("Seekers were not found.");
                }
                else
                {
                    response = new ItemsResponse<BaseUserProfile> { Items = list };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Generic Error: ${ex.Message}");
            }
            return StatusCode(code, response);
        }
        [HttpGet("provider/user")]
        public ActionResult<ItemsResponse<Appointment>> GetProviderUserAppointments(int id, int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<Appointment> paged = _service.GetProviderUserAppointments(userId, id, pageIndex, pageSize);

                if (paged == null)
                {
                    code = 404;
                    response = new ErrorResponse("There are no appointments with this seeker.");
                }
                else
                {
                    response = new ItemResponse<Paged<Appointment>> { Item = paged };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Server Error: {ex.Message}");
            }


            return StatusCode(code, response);

        }
        #endregion

        #region Seeker Appointments
        [HttpGet("seeker")]
        public ActionResult<ItemsResponse<Appointment>> GetSeekerAppointments(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;//do not declare an instance.

            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<Appointment> paged = _service.GetSeekerAppointments(userId, pageIndex, pageSize);

                if (paged == null)
                {
                    code = 404;
                    response = new ErrorResponse("There are no appointments.");
                }
                else
                {
                    response = new ItemResponse<Paged<Appointment>> { Item = paged };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Server Error: {ex.Message}");
            }


            return StatusCode(code, response);

        }
        [HttpGet("seeker/confirmed")]
        public ActionResult<ItemsResponse<Appointment>> GetSeekerConfirmedAppointments(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<Appointment> paged = _service.GetSeekerConfirmedAppointments(userId, pageIndex, pageSize);

                if (paged == null)
                {
                    code = 404;
                    response = new ErrorResponse("There are no confirmed appointments.");
                }
                else
                {
                    response = new ItemResponse<Paged<Appointment>> { Item = paged };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Server Error: {ex.Message}");
            }


            return StatusCode(code, response);

        }
        [HttpGet("seeker/cancelled")]
        public ActionResult<ItemsResponse<Appointment>> GetSeekerCancelledAppointments(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<Appointment> paged = _service.GetSeekerCancelledAppointments(userId, pageIndex, pageSize);

                if (paged == null)
                {
                    code = 404;
                    response = new ErrorResponse("There are no cancelled appointments.");
                }
                else
                {
                    response = new ItemResponse<Paged<Appointment>> { Item = paged };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Server Error: {ex.Message}");
            }


            return StatusCode(code, response);

        }
        [HttpGet("seeker/users")]
        public ActionResult<ItemsResponse<BaseUserProfile>> GetUsersBySeeker()
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                List<BaseUserProfile> list = _service.GetUsersBySeeker(userId);
                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("Providers were not found.");
                }
                else
                {
                    response = new ItemsResponse<BaseUserProfile> { Items = list };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Generic Error: ${ex.Message}");
            }
            return StatusCode(code, response);
        }
        [HttpGet("seeker/user")]
        public ActionResult<ItemsResponse<Appointment>> GetSeekerUserAppointments(int id, int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<Appointment> paged = _service.GetSeekerUserAppointments(userId, id, pageIndex, pageSize);

                if (paged == null)
                {
                    code = 404;
                    response = new ErrorResponse("There are no appointments with this provider.");
                }
                else
                {
                    response = new ItemResponse<Paged<Appointment>> { Item = paged };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Server Error: {ex.Message}");
            }


            return StatusCode(code, response);

        }
        #endregion



        [HttpGet("{id:int}")]
        public ActionResult<ItemResponse<Appointment>> GetById(int id)
        {

            int iCode = 200;
            BaseResponse response = null;

            try
            {
                Appointment appointment = _service.Get(id);

                if (appointment == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("This appointment does not exist.");
                }
                else

                    response = new ItemResponse<Appointment> { Item = appointment };
            }
            catch (Exception ex)
            {

                iCode = 500;
                response = new ErrorResponse($"Server Error: {ex.Message}");
                base.Logger.LogError(ex.Message.ToString());
            }

            return StatusCode(iCode, response);
        }

        #region C-UD
        [HttpPost("")]
        public ActionResult<ItemResponse<int>> Create(AppointmentAddRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _authService.GetCurrentUserId();

                int id = _service.Add(model, userId);
                ItemResponse<int> response = new ItemResponse<int>() { Item = id };

                result = Created201(response);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse(ex.Message);

                result = StatusCode(500, response);
            }

            return result;

        }
        [HttpPut("{id:int}")]
        public ActionResult<SuccessResponse> Update(AppointmentUpdateRequest model)
        {
            int code = 200;
            BaseResponse response = null;


            try
            {
                int userId = _authService.GetCurrentUserId();
                _service.Update(model, userId);
                Appointment appointmentWithEmail = _service.GetAppointmentForEmail(model.Id);
                _emailService.ConfirmAppointmentEmail(appointmentWithEmail);
                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }
        [HttpDelete("{id:int}")]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                _service.Delete(id);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }
        #endregion

        #region Non-Appointment
        [HttpGet("availability")]
        public ActionResult<ItemResponse<ScheduleAvailablityByDate>> GetAvailability(int userId, DateTime scheduleDate)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                ScheduleAvailablityByDate availablity = _service.GetAvailability(userId, scheduleDate);

                if (availablity == null)
                {
                    code = 404;
                    response = new ErrorResponse("No Availability found");
                }
                else
                {
                    response = new ItemResponse<ScheduleAvailablityByDate> { Item = availablity };

                }

            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }
            return StatusCode(code, response);
        }

        [HttpPost("email")]
        public ActionResult<SuccessResponse> Create(AppointUpdateInfo model)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                model.To = _service.GetEmail(model.SenderId);
                model.From = _service.GetEmail(_authService.GetCurrentUserId());
                _emailService.AppointmentQuestion(model);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }
            return StatusCode(code, response);

        }

        [HttpGet("seekerProviderLog")]
        public ActionResult<ItemsResponse<Appointment>> SelectProviderBySeekerId(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;//do not declare an instance.

            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<Appointment> paged = _service.SelectProviderBySeekerId(userId, pageIndex, pageSize);

                if (paged == null)
                {
                    code = 404;
                    response = new ErrorResponse("App Resource not found.");
                }
                else
                {
                    response = new ItemResponse<Paged<Appointment>> { Item = paged };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Server Error: {ex.Message}");
            }


            return StatusCode(code, response);

        }
        #endregion
    }


}