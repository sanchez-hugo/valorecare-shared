using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Domain.Coordinates;
using Sabio.Models.Requests;
using Sabio.Models.Requests.Locations;
using Sabio.Services;
using Sabio.Services.Interfaces;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/Locations")]
    [ApiController]
    public class LocationApiController : BaseApiController
    {
        ILogger _logger;
        ILocationsService _locationsServices;
        IAuthenticationService<int> _authService = null;

        public LocationApiController(ILogger<LocationApiController> logger, ILocationsService locationsServices, IAuthenticationService<int> authService) : base(logger)
        {
            _logger = logger;
            _locationsServices = locationsServices;
            _authService = authService;
        }
        [HttpPut("{id:int}")]
        public ActionResult<ItemResponse<int>> Update(LocationUpdateRequest model)
        {
            int userId = _authService.GetCurrentUserId();
            _locationsServices.Update(model, userId);

            SuccessResponse response = new SuccessResponse();

            return Ok(response);

        }

        [HttpPost]
        public ActionResult<ItemResponse<int>> Create(LocationAddRequest model)
        {
            ObjectResult result = null;
            int userId = _authService.GetCurrentUserId();

            try
            {

                int id = _locationsServices.Create(model, userId);
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


        [HttpGet("{id:int}")]
        public ActionResult<ItemResponse<Location>> GetById(int id)
        {
            int userId = _authService.GetCurrentUserId();
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                Location widgetLocation = _locationsServices.Get(id);

                if (widgetLocation == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("Application Resource not found");
                }
                else
                {

                    response = new ItemResponse<Location> { Item = widgetLocation };
                }
            }
            catch (SqlException sqlEx)
            {
                iCode = 500;
                response = new ErrorResponse($"SqlException Error: {sqlEx.Message}");
                base.Logger.LogError(sqlEx.ToString());
            }

            return StatusCode(iCode, response);
        }
        [HttpGet("paginate")]
        public ActionResult<ItemsResponse<Paged<Location>>> Pagination(int pageIndex, int pageSize)
        {
            ActionResult result = null;
            int userId = _authService.GetCurrentUserId();
            try
            {
                Paged<Location> paged = _locationsServices.Pagination(pageIndex, pageSize);
                if (paged == null)
                {
                    result = NotFound404(new ErrorResponse("Item Not Found"));
                }
                else
                {
                    ItemResponse<Paged<Location>> response = new ItemResponse<Paged<Location>>();
                    response.Item = paged;
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }
            return result;

        }

        [HttpGet("search")]
        public ActionResult<ItemsResponse<Paged<Location>>> Pagination(int pageIndex, int pageSize, string query)
        {
            ActionResult result = null;
            try
            {
                Paged<Location> paged = _locationsServices.Search(pageIndex, pageSize, query);
                if (paged == null)
                {
                    result = NotFound404(new ErrorResponse("Item Not Found"));
                }
                else
                {
                    ItemResponse<Paged<Location>> response = new ItemResponse<Paged<Location>>();
                    response.Item = paged;
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }
            return result;

        }

        [HttpGet("createdby")]
        public ActionResult<ItemsResponse<Paged<Location>>> PagedCreate(int pageIndex, int pageSize)
        {
            ActionResult result = null;
            int userId = _authService.GetCurrentUserId();
            try
            {
                Paged<Location> paged = _locationsServices.PagedCreate(pageIndex, pageSize, userId);
                if (paged == null)
                {
                    result = NotFound404(new ErrorResponse("Item Not Found"));
                }
                else
                {
                    ItemResponse<Paged<Location>> response = new ItemResponse<Paged<Location>>();
                    response.Item = paged;
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }
            return result;

        }
        [HttpGet("geography")]
        public ActionResult<ItemsResponse<Paged<Location>>> PagedGeo(int Latitude, int Longitude, int Radius)
        {
            ActionResult result = null;
            try
            {
                Paged<Location> paged = _locationsServices.PagedGeo(Latitude, Longitude, Radius);
                if (paged == null)
                {
                    result = NotFound404(new ErrorResponse("Item Not Found"));
                }
                else
                {
                    ItemResponse<Paged<Location>> response = new ItemResponse<Paged<Location>>();
                    response.Item = paged;
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                result = StatusCode(500, new ErrorResponse(ex.Message.ToString()));
            }
            return result;

        }

        [HttpDelete("{id:int}")]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            int code = 200;
            BaseResponse response = null;// do not declare an instance

            try
            {
                _locationsServices.Delete(id);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {

                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }


        [HttpGet]
        public ActionResult<ItemResponse<Coordinates>> GetByZip(string zip)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                Coordinates item = _locationsServices.GetByZip(zip);

                if (item == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("Application Resources Not Found");
                }
                else
                {
                    response = new ItemResponse<Coordinates> { Item = item };
                }


            }
            catch (Exception ex)
            {
                iCode = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Generic Errors: {ex.Message}");
            }
            return StatusCode(iCode, response);
        }


    }

}
