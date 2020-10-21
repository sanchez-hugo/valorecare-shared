using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Domain.Faq;
using Sabio.Models.Requests.Faq;
using Sabio.Services;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/faqs")]
    [ApiController]
    public class FaqApiController : BaseApiController
    {
        private IFaqService _service = null;
        private IAuthenticationService<int> _authService = null;
        public FaqApiController(IFaqService service, ILogger<FaqApiController> logger, IAuthenticationService<int> authService) : base(logger)
        {
            _service = service;
            _authService = authService;
        }


        //[HttpGet("category/{categoryId:int}")]
        //public ActionResult<ItemResponse<List<Faq>>> GetAllByCategory(int categoryId)
        //{
        //    int code = 200;
        //    BaseResponse response = null;

        //    try
        //    {

        //        List<Faq> list = _service.GetAllByCategory(categoryId);


        //        if (list == null)

        //        {
        //            code = 404;
        //            response = new ErrorResponse("App Resouce not found.");
        //        }

        //        else
        //        {

        //            response = new ItemResponse<List<Faq>> { Item = list };

        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        code = 500;
        //        response = new ErrorResponse(ex.Message);
        //        base.Logger.LogError(ex.ToString());
        //    }
        //    return StatusCode(code, response);
        //}

        [HttpGet("categories")]
        public ActionResult<ItemsResponse<FaqCategory>> GetCategories()
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<FaqCategory> list = _service.GetCategories();

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App Resource not found.");
                }
                else
                {
                    response = new ItemsResponse<FaqCategory> { Items = list };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }


            return StatusCode(code, response);

        }


        [HttpGet]
        public ActionResult<ItemsResponse<Faq>> Get()
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<Faq> list = _service.Get();

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("App Resource not found.");
                }
                else
                {
                    response = new ItemsResponse<Faq> { Items = list };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
                base.Logger.LogError(ex.ToString());
            }


            return StatusCode(code, response);

        }

        [HttpPost]
        public ActionResult<ItemResponse<int>> Add(FaqAddRequest model)
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

        [HttpGet("categoryid/{categoryId:int}")]
        public ActionResult<ItemResponse<Faq>> GetAll(int categoryId)

        {
            int iCode = 200;
            BaseResponse response = null;
            try
            {
                Faq faq = _service.GetAll(categoryId);

                if (faq == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("Application Resource not found. The thing you came for is not here.");


                }
                else
                {
                    response = new ItemResponse<Faq> { Item = faq };

                }
            }
            catch (Exception ex)
            {
                iCode = 500;

                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Generic Error: { ex.Message }");

            }


            return StatusCode(iCode, response);
        }

        [HttpGet("createdby")]
        public ActionResult<ItemResponse<Paged<Faq>>> GetByCreatedBy(int pageIndex, int pageSize)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            
            try
            {
                int userId = _authService.GetCurrentUserId();
                Paged <Faq> paged = _service.GetByCreatedBy(pageIndex, pageSize, userId);

                if (paged == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                }
                else
                    responseData = new ItemResponse<Paged<Faq>> { Item = paged };
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
        public ActionResult<ItemResponse<Faq>> GetById(int id)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                Faq faq = _service.GetById(id);

                if (faq == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                }
                else
                    responseData = new ItemResponse<Faq> { Item = faq };
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
        public ActionResult<SuccessResponse> Update(FaqUpdateRequest model)
        {
            int responseCode = 200;
            BaseResponse responseData = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                _service.Update(model, userId);
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