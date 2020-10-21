using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.S3.Model.Internal.MarshallTransformations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Sabio.Models.Domain.AppSettings;
using Sabio.Models.Domain.Stripe;
using Sabio.Models.Requests;
using Sabio.Models.Requests.Stripe;
using Sabio.Services;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;
using Stripe;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/connect")]
    [ApiController]
    public class ConnectApiController : BaseApiController
    {
        private IAuthenticationService<int> _authService = null;
        private AppKeys _appKeys = null;
        private StripeClient _client = null;
        private IStripeConnectService _service = null;

        public ConnectApiController(IStripeConnectService service, ILogger<ConnectApiController> logger, IAuthenticationService<int> authService, IOptions<AppKeys> appKeys) : base(logger)
        {
            _service = service;
            _authService = authService;
            _appKeys = appKeys.Value;
            _client = new StripeClient(_appKeys.StripeApiKey);
        }

        [HttpGet("oauth")]
        public ActionResult<ItemResponse<string>> HandleOAuthRedirect(string state, string code)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                // Check if states match
                // Create an authorization token and match it with ours
                bool isStateSame = _service.StateMatches(state);
                if (!isStateSame)
                {
                    responseCode = 500;
                    responseData = new ErrorResponse("State does not match.");
                    return StatusCode(responseCode, responseData);
                }

                // Get Account Id and save it
                OAuthToken oAuthToken = CreateStripeOAuthToken(code);
                string AccountId = oAuthToken.StripeUserId;
                int UserId = _authService.GetCurrentUserId();

                int id = _service.AddAccountId(UserId, AccountId);
                if (id == 0)
                {
                    responseCode = 400;
                    responseData = new ErrorResponse("Account id was not saved.");
                    return StatusCode(responseCode, responseData);
                }

                responseData = new ItemResponse<string> { Item = AccountId };
                return Redirect("https://valore.azurewebsites.net/connect/success");
            }
            catch (StripeException e)
            {
                if (e.StripeError != null && e.StripeError.Error == "invalid_grant")
                {
                    responseCode = 400;
                    responseData = new ErrorResponse(e.Message);
                    return StatusCode(responseCode, responseData);
                }
                else
                {
                    responseCode = 500;
                    responseData = new ErrorResponse("Unkown error occurred.");
                    return StatusCode(responseCode, responseData);
                }
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpPost("intent")]
        public ActionResult<ItemResponse<string>> GetPaymentInent(PaymentIntentCreateOptions options)
        {

            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {

                PaymentIntent intent = CreateIntent(options);
                var clientSecret = intent.ClientSecret;

                responseData = new ItemResponse<string> { Item = clientSecret };
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }

        [HttpGet("transactions")]
        public ActionResult<ItemResponse<StripeList<BalanceTransaction>>> GetBalanceTransactions()
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                StripeList<BalanceTransaction> transactions = ListBalanceTransactions();
                responseData = new ItemResponse<StripeList<BalanceTransaction>> { Item = transactions };
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        #region Stripe Accounts
        [HttpGet("account")]
        public ActionResult<ItemResponse<string>> GetAccountId()
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {

                int UserId = _authService.GetCurrentUserId();
                string AccountId = _service.GetAccountId(UserId);
                if (AccountId == "")
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Account not found.");

                }
                else
                    responseData = new ItemResponse<string> { Item = AccountId };
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpGet("account/user")]
        public ActionResult<ItemResponse<string>> GetAccountId(int id)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {

                string AccountId = _service.GetAccountId(id);
                if (AccountId == "")
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Account not found.");

                }
                else
                    responseData = new ItemResponse<string> { Item = AccountId };
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        #endregion

        #region Stripe Appointment Charges
        [HttpPost("charge/appointment")]
        public ActionResult<SuccessResponse> AddCharge(AppointmentChargeGetRequest request)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                int appointmentId = request.AppointmentId;
                string paymentIntentId = request.PaymentIntentId;

                // Get charge id by payment intent id
                StripeList<Charge> charges = GetCharges(paymentIntentId);
                string chargeId = charges.Data[0].Id;

                /* Good place to get charge info here */

                // Create a StripeChargeAddRequest
                AppointmentChargeAddRequest model = new AppointmentChargeAddRequest
                {
                    AppointmentId = appointmentId,
                    StripeChargeId = chargeId
                };

                // Add charge to the database
                _service.AddStripeCharge(model);

                // When successful return success response
                responseData = new SuccessResponse();
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpPut("charge/appointment")]
        public ActionResult<SuccessResponse> RefundAppointmentCharge(int id, string reason)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                // Get charge id using appointment id
                StripeAppointmentCharge appointmentCharge = _service.GetChargeByAppointmentId(id);
                if (appointmentCharge == null)
                {
                    string msg = "This appointment does not have an associated charge.";
                    responseCode = 404;
                    responseData = new ErrorResponse(msg);
                    return StatusCode(responseCode, responseData);
                }
                else if (appointmentCharge.IsRefunded == true)
                {
                    string msg = "This appointment has already been refunded.";
                    responseCode = 400;
                    responseData = new ErrorResponse(msg);
                    return StatusCode(responseCode, responseData);
                }
                string chargeId = appointmentCharge.StripeChargeId;

                // Process a refund for this charge with chargeId
                Refund refund = RefundCharge(chargeId);
                if (refund.Status != "succeeded")
                {
                    string msg = "This charge is not refundable.";
                    responseCode = 404;
                    responseData = new ErrorResponse(msg);
                    return StatusCode(responseCode, responseData);
                }

                // Update stripe appointment charge table
                _service.UpdateStripeChargeByAppointmentId(id, true);
                _service.CancelAppointment(id, reason);

                // When successful return success response
                responseData = new SuccessResponse();
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpPost("transfer")]
        public ActionResult<SuccessResponse> TransferChargeToProvider(ChargeTransferRequest request)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                int appointmentId = request.AppointmentId;
                int providerId = request.ProviderId;

                // Get charge id using appointment id
                StripeAppointmentCharge appointmentCharge = _service.GetChargeByAppointmentId(appointmentId);
                if (appointmentCharge == null)
                {
                    string msg = "This appointment does not have an associated charge.";
                    responseCode = 404;
                    responseData = new ErrorResponse(msg);
                    return StatusCode(responseCode, responseData);
                }
                else if (appointmentCharge.IsRefunded == true)
                {
                    string msg = "This appointment has been refunded.";
                    responseCode = 400;
                    responseData = new ErrorResponse(msg);
                    return StatusCode(responseCode, responseData);
                }
                string chargeId = appointmentCharge.StripeChargeId;

                // Get account id using provider id
                string accountId = _service.GetAccountId(providerId);
                if (String.IsNullOrEmpty(accountId))
                {
                    string msg = "This user does not have a Connect Id.";
                    responseCode = 404;
                    responseData = new ErrorResponse(msg);
                    return StatusCode(responseCode, responseData);
                }

                // Create the transfer using charge and account ids
                Transfer transfer = TransferCharge(chargeId, accountId);
                if (transfer == null)
                {
                    string msg = "Transfer could not be created.";
                    responseCode = 404;
                    responseData = new ErrorResponse(msg);
                    return StatusCode(responseCode, responseData);
                }

                _service.DeleteAppointment(request.AppointmentId);

                // When successful return success response
                responseData = new SuccessResponse();
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }

        #endregion

        #region Stripe
        private OAuthToken CreateStripeOAuthToken(string code)
        {
            var options = new OAuthTokenCreateOptions
            {
                GrantType = "authorization_code",
                Code = code,
            };
            OAuthToken oAuthToken = null;
            var service = new OAuthTokenService(_client);
            oAuthToken = service.Create(options);
            return oAuthToken;
        }
        private PaymentIntent CreateIntent(PaymentIntentCreateOptions options)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;


            options.Currency = "usd";
            options.PaymentMethodTypes = new List<string> { "card" };
            options.TransferGroup = "appointments";
            options.Description = "Appointment creation";

            var service = new PaymentIntentService();
            var paymentIntent = service.Create(options);

            return paymentIntent;
        }
        private StripeList<Charge> GetCharges(string intent)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            var options = new ChargeListOptions { PaymentIntent = intent };
            var service = new ChargeService();
            StripeList<Charge> charges = service.List(
              options
            );

            return charges;
        }
        private Refund RefundCharge(string chargeId)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
            var options = new RefundCreateOptions
            {
                Charge = chargeId,  
            };
            var service = new RefundService();
            var refund = service.Create(options);
            return refund;
        }
        private Transfer TransferCharge(string chargeId, string accountId)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            var chargeService = new ChargeService();
            var charge = chargeService.Get(chargeId);

            long chargeAmount = charge.Amount;
            double fee = chargeAmount * .05; // collecting a 5% for charge
            long amountFee = Convert.ToInt64(fee);

            var options = new TransferCreateOptions
            {
                Amount = chargeAmount - amountFee,
                Currency = "usd",
                SourceTransaction = chargeId,
                Destination = accountId,
                Description = "Appointment transfer",
            };
            var transferService = new TransferService();
            var transfer = transferService.Create(options);
            return transfer;
        }
        private StripeList<BalanceTransaction> ListBalanceTransactions()
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            //DateTime dateNow = DateTime.Now;
            DateTime createdDate = DateTime.Now.AddDays(-30);


            var options = new BalanceTransactionListOptions
            {
                Created = new DateRangeOptions
                {
                    GreaterThan = createdDate,
                },
                Limit = 100
            };
            var service = new BalanceTransactionService();
            StripeList<BalanceTransaction> balanceTransactions = service.List(
              options);
            return balanceTransactions;
        }

        #endregion

    }
}