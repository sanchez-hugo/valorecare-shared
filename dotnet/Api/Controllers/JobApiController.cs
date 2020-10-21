using System;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models;
using Sabio.Models.Domain.Job;
using Sabio.Models.Requests.Job;
using Sabio.Services;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/jobs")]
    [ApiController]
    public class JobApiController : BaseApiController
    {
        private IJobService _service = null;
        private IAuthenticationService<int> _authService = null;
        public JobApiController(IJobService service, ILogger<JobApiController> logger, IAuthenticationService<int> authService) : base(logger)
        {
            _service = service;
            _authService = authService;
        }
        [HttpPost]
        public ActionResult<ItemResponse<int>> Create(JobAddRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                int id = _service.Add(model, userId);
                ItemResponse<int> response = new ItemResponse<int> { Item = id };
                result = Created201(response);
            }
            catch (Exception exception)
            {
                base.Logger.LogError(exception.ToString());
                ErrorResponse response = new ErrorResponse(exception.Message);
                result = StatusCode(500, response);
            }

            return result;
        }
        [HttpGet]
        public ActionResult<ItemResponse<Paged<Job>>> Get(int pageIndex, int pageSize)
        {
            int responseCode = 200;
            BaseResponse responseData = null;

            try
            {
                Paged<Job> paged = _service.Get(pageIndex, pageSize);

                if (paged == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                }
                else
                    responseData = new ItemResponse<Paged<Job>> { Item = paged };
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse(exception.Message);
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpGet("createdby")]
        public ActionResult<ItemResponse<Paged<Job>>> GetByCreatedBy(int pageIndex, int pageSize)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            
            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<Job> paged = _service.GetByCreatedBy(pageIndex, pageSize, userId);

                if (paged == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                }
                else
                    responseData = new ItemResponse<Paged<Job>> { Item = paged };
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse(exception.Message);
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpGet("search")]
        public ActionResult<ItemResponse<Paged<Job>>> Search(string query, int pageIndex, int pageSize)
        {
            int responseCode = 200;
            BaseResponse responseData = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged<Job> paged = _service.SearchByCreatedBy(query, pageIndex, pageSize, userId);

                if (paged == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                }
                else
                    responseData = new ItemResponse<Paged<Job>> { Item = paged };
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse(exception.Message);
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpGet("nearby")]
        public ActionResult<ItemResponse<Paged<JobWithDistance>>> GetNearby(int pageIndex, int pageSize, double radius, string zip)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            
            try
            {
                Paged<JobWithDistance> paged = _service.GetNearby(pageIndex, pageSize, radius, zip);

                if (paged == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                }
                else
                    responseData = new ItemResponse<Paged<JobWithDistance>> { Item = paged };
            }
            catch (SqlException exception) {
                responseCode = 400;
                responseData = new ErrorResponse("Please enter a valid radius and zip code.");
                base.Logger.LogError(exception.ToString());
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse(exception.Message);
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpGet("nearby/search")]
        public ActionResult<ItemResponse<Paged<JobWithDistance>>> SearchNearby(string query, int pageIndex, int pageSize, double radius, string zip)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            
            try
            {
                Paged<JobWithDistance> paged = _service.SearchNearby(query, pageIndex, pageSize, radius, zip);

                if (paged == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                }
                else
                    responseData = new ItemResponse<Paged<JobWithDistance>> { Item = paged };
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse(exception.Message);
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpGet("{id:int}")]
        public ActionResult<ItemResponse<Job>> GetById(int id)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                Job job = _service.GetById(id);

                if (job == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                }
                else
                    responseData = new ItemResponse<Job> { Item = job };
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }
            return StatusCode(responseCode, responseData);
        }
        [HttpPut("{id:int}")]
        public ActionResult<SuccessResponse> Update(JobUpdateRequest model)
        {
            int responseCode = 200;
            BaseResponse responseData = null;

            try
            {
                _service.Update(model, _authService.GetCurrentUserId());
                responseData = new SuccessResponse();
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse(exception.Message);
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpDelete("{id:int}")]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            int responseCode = 200;
            BaseResponse responseData = null;

            try
            {
                _service.Delete(id);
                responseData = new SuccessResponse();
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse(exception.Message);
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
    }
}