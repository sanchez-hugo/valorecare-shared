using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters.Xml;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Sabio.Models.Domain.AppSettings;
using Sabio.Models.Domain.Stripe;
using Sabio.Models.Requests.Stripe;
using Sabio.Services;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;
using Stripe;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/payments")]
    [ApiController]
    public class PaymentsApiController : BaseApiController
    {
        private IStripeCustomerService _service = null;
        private IAuthenticationService<int> _authService = null;
        private AppKeys _appKeys = null;

        public PaymentsApiController(IStripeCustomerService service, ILogger<PaymentsApiController> logger, IAuthenticationService<int> authService, IOptions<AppKeys> appKeys) : base(logger)
        {
            _appKeys = appKeys.Value;
            _service = service;
            _authService = authService;
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
        }

        [HttpPost("intent")]
        public ActionResult<ItemResponse<string>> GetPaymentInent(PaymentIntentCreateOptions options)
        {
            int responseCode = 200;
            BaseResponse responseData = null;

            try
            {
                var intent = CreateIntent(options);
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

        #region Customer
        [HttpGet("customer")]
        public ActionResult<ItemResponse<string>> GetCustomerId()
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                string customerId = "";

                /* Check if user has an Id */
                int UserId = _authService.GetCurrentUserId();
                customerId = _service.GetCustomerId(UserId);

                if (customerId == "")
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                }
                else {
                    responseData = new ItemResponse<string> { Item = customerId };
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

        [HttpPost("customer")]
        public ActionResult CreateCustomerId(CustomerCreateOptions options)
        {
            int responseCode = 201;
            BaseResponse responseData = null;
            try
            {
                var customer = CreateStripeCustomer(options);

                if (customer == null)
                {
                    responseCode = 400;
                    responseData = new ErrorResponse("Could not set up an account with Stripe");

                }
                else
                {
                    string customerId = customer.Id;

                    int UserId = _authService.GetCurrentUserId();

                    int id = _service.AddCustomerId(UserId, customerId); // Adds customer id to DB

                    if (id == 0)
                    {
                        responseCode = 400;
                        responseData = new ErrorResponse("Could not add customer id");

                    }
                    else
                        responseData = new ItemResponse<string> { Item = customerId };
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
        #endregion

        #region Prices
        [HttpGet("prices")]
        public ActionResult<ItemResponse<StripeList<Price>>> GetPrices(string role)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                int roleId = _service.GetRoleId(role);
                StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
                if (roleId == 0)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Invalid role");
                    return StatusCode(responseCode, responseData);
                }

                string productId = _service.GetProductId(roleId);

                if (productId == "")
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("A product was not found");
                    return StatusCode(responseCode, responseData);
                }

                StripeList<Price> prices = GetStripePricesByProductId(productId);

                if (prices == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                    return StatusCode(responseCode, responseData);
                }

                responseData = new ItemResponse<StripeList<Price>> { Item = prices };
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }

        //[HttpPost("prices")]
        //public ActionResult CreatePrice(CustomerCreateOptions options)
        //{
        //    int responseCode = 200;
        //    BaseResponse responseData = null;
        //    try
        //    {
        //        var customerId = "";
        //        int UserId = _authService.GetCurrentUserId();

        //        var customer = CreateStripeCustomer(options);
        //        customerId = customer.Id;
        //        _service.Add(UserId, customerId); // Adds customer id to DB

        //        responseData = new ItemResponse<string> { Item = customerId };
        //    }
        //    catch (Exception exception)
        //    {
        //        responseData = new ErrorResponse($"Generic Error: {exception.Message}");
        //        base.Logger.LogError(exception.ToString());
        //    }

        //    return StatusCode(responseCode, responseData);
        //}
        #endregion

        #region Products
        [HttpGet("products")]
        public ActionResult<ItemResponse<StripeList<Price>>> GetProduct(string id)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {

                StripeList<Price> prices = GetStripePricesByProductId(id);
                StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
                if (prices == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                    return StatusCode(responseCode, responseData);
                }
                else
                    responseData = new ItemResponse<StripeList<Price>> { Item = prices };
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

        #region Subscriptions
        [HttpPost("subscription")]
        public ActionResult<ItemResponse<Stripe.Subscription>> CreateSubscription(StripeSubAddRequest model)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                /* add step to check if user is subscribed? */
                int userId = _authService.GetCurrentUserId();
                StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
                Sabio.Models.Domain.Stripe.Subscription existingSubscription = _service.GetSubscriptionByUserId(userId);

                if (existingSubscription != null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Subscription already exists.");
                    return StatusCode(responseCode, responseData);
                }

                Customer customer = UpdateStripeCustomer(model.CustomerId, model.BillingDetails);
                if (customer == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Customer information was not updated.");
                    return StatusCode(responseCode, responseData);
                }

                // Attach payment method to customer
                PaymentMethod paymentMethod = AttachStripePaymentMethod(model.CustomerId, model.PaymentMethodId);
                if (paymentMethod == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Payment method was not attached.");
                    return StatusCode(responseCode, responseData);
                };

                // Create stripe subscription

                Newtonsoft.Json.Linq.JObject subscriptionRawJObject = CreateStripeSubscription(model).RawJObject;
                string subscriptionString = subscriptionRawJObject.ToString();
                Stripe.Subscription stripeSubscription = JsonConvert.DeserializeObject<Stripe.Subscription>(subscriptionString);

                if (stripeSubscription == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Subscription was not created.");
                    return StatusCode(responseCode, responseData);
                }
                else
                    responseData = new ItemResponse<Stripe.Subscription>() { Item = stripeSubscription };

                // Create database subscription
                SubscriptionAddRequest request = new SubscriptionAddRequest();
                request.SubscriptionId = stripeSubscription.Id;
                request.UserId = _authService.GetCurrentUserId();
                request.CustomerId = stripeSubscription.CustomerId;
                if (stripeSubscription.Status == "active")
                    request.IsSubscriptionActive = true;
                else
                    request.IsSubscriptionActive = false;
                request.DateEnded = stripeSubscription.EndedAt;

                int id = _service.AddSubscription(request);
                if (id == 0)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Subscription was not saved.");
                    return StatusCode(responseCode, responseData);
                };
            }
            catch (StripeException e)
            {
                switch (e.StripeError.Type)
                {
                    case "card_error":
                        responseCode = (int)e.HttpStatusCode;
                        responseData = new ErrorResponse(e.StripeError.Message);
                        base.Logger.LogError(e.ToString());
                        break;
                    case "api_connection_error":
                        break;
                    case "api_error":
                        break;
                    case "authentication_error":
                        break;
                    case "invalid_request_error":
                        break;
                    case "rate_limit_error":
                        break;
                    case "validation_error":
                        break;
                    default:
                        // Unknown Error Type
                        break;
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
        [HttpGet("subscription")]
        public ActionResult<ItemResponse<Stripe.Subscription>> GetSubscription()
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                int userId = _authService.GetCurrentUserId();
                StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
                Sabio.Models.Domain.Stripe.Subscription subscription = _service.GetSubscriptionByUserId(userId);
                if (subscription == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Subscription not found.");
                    return StatusCode(responseCode, responseData);
                }

                string subscriptionId = subscription.SubscriptionId;
                Newtonsoft.Json.Linq.JObject subscriptionRawJObject = GetStripeSubscription(subscriptionId).RawJObject;
                string subscriptionString = subscriptionRawJObject.ToString();
                Stripe.Subscription stripeSubscription = JsonConvert.DeserializeObject<Stripe.Subscription>(subscriptionString);
                responseData = new ItemResponse<Stripe.Subscription>() { Item = stripeSubscription };

            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpGet("subscription/status")]
        public ActionResult<ItemResponse<Sabio.Models.Domain.Stripe.Subscription>> GetSubscriptionStatus()
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                int userId = _authService.GetCurrentUserId();
                StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
                Sabio.Models.Domain.Stripe.Subscription subscription = _service.GetSubscriptionByUserId(userId);
                if (subscription == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Subscription not found.");
                    return StatusCode(responseCode, responseData);
                }
                responseData = new ItemResponse<Sabio.Models.Domain.Stripe.Subscription> { Item = subscription };

            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpPut("subscription/plan")]
        public ActionResult<ItemResponse<Stripe.Subscription>> UpdateSubscriptionPlan(StripeSubUpdatePlanRequest model)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
                // Update stripe subscription
                Newtonsoft.Json.Linq.JObject subscriptionRawJObject = UpdateStripeSubscriptionPlan(model).RawJObject;
                string subscriptionString = subscriptionRawJObject.ToString();
                Stripe.Subscription stripeSubscription = JsonConvert.DeserializeObject<Stripe.Subscription>(subscriptionString);
                responseData = new ItemResponse<Stripe.Subscription>() { Item = stripeSubscription };

                if (stripeSubscription == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Subscription was not updated.");
                    return StatusCode(responseCode, responseData);
                };

                // Update database subscription
                SubscriptionAddRequest request = new SubscriptionAddRequest();
                request.SubscriptionId = stripeSubscription.Id;
                request.UserId = _authService.GetCurrentUserId();
                request.CustomerId = stripeSubscription.CustomerId;
                request.IsSubscriptionActive = stripeSubscription.Status == "active";
                request.DateEnded = stripeSubscription.EndedAt;

                _service.UpdateSubscription(request);
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpPut("subscription/payment")]
        public ActionResult<ItemResponse<Stripe.Subscription>> UpdateSubscriptionPayment(StripeSubUpdatePaymentRequest model)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
                //Update Customer Billing Options
                Customer customer = UpdateStripeCustomer(model.CustomerId, model.BillingDetails);
                if (customer == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Customer information was not updated.");
                    return StatusCode(responseCode, responseData);
                }
                // Attach payment method to customer
                PaymentMethod paymentMethod = AttachStripePaymentMethod(model.CustomerId, model.PaymentMethodId);
                if (paymentMethod == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Payment method was not attached.");
                    return StatusCode(responseCode, responseData);
                };

                // Update stripe subscription
                Newtonsoft.Json.Linq.JObject subscriptionRawJObject = UpdateStripeSubscriptionPayment(model).RawJObject;
                string subscriptionString = subscriptionRawJObject.ToString();
                Stripe.Subscription stripeSubscription = JsonConvert.DeserializeObject<Stripe.Subscription>(subscriptionString);

                if (stripeSubscription == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Subscription was not updated.");
                    return StatusCode(responseCode, responseData);
                }
                else
                    responseData = new ItemResponse<Stripe.Subscription>() { Item = stripeSubscription };

                // Update database subscription
                SubscriptionAddRequest request = new SubscriptionAddRequest();
                request.SubscriptionId = stripeSubscription.Id;
                request.UserId = _authService.GetCurrentUserId();
                request.CustomerId = stripeSubscription.CustomerId;
                request.IsSubscriptionActive = stripeSubscription.Status == "active";
                request.DateEnded = stripeSubscription.EndedAt;

                _service.UpdateSubscription(request);
            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }
        [HttpPut("subscription/status")]
        public ActionResult<SuccessResponse> UpdateSubscriptionStatus(string id)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
                int userId = _authService.GetCurrentUserId();
                _service.UpdateSubscriptionStatus(id, true, userId);

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
        [HttpDelete("subscription")]
        public ActionResult<SuccessResponse> CancelSubscription(string id)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
                Stripe.Subscription stripeSubscription = CancelStripeSubscription(id);

                if (stripeSubscription == null)
                {
                    responseCode = 404;
                    responseData = new ErrorResponse("Item was not found");
                    return StatusCode(responseCode, responseData);
                }

                SubscriptionAddRequest request = new SubscriptionAddRequest();
                request.SubscriptionId = id;
                request.UserId = _authService.GetCurrentUserId();
                request.CustomerId = stripeSubscription.CustomerId;
                request.IsSubscriptionActive = stripeSubscription.Status == "active";
                request.DateEnded = stripeSubscription.EndedAt;

                _service.UpdateSubscription(request);

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

        [HttpPost("intent/create")]
        public ActionResult<ItemResponse<Stripe.PaymentIntent>> CreateIntentApi(PaymentIntentCreateOptions options)
        {
            int responseCode = 200;
            BaseResponse responseData = null;
            try
            {
                int userId = _authService.GetCurrentUserId();
                // Set your secret key. Remember to switch to your live secret key in production!
                StripeConfiguration.ApiKey = _appKeys.StripeApiKey;


                var service = new PaymentIntentService();
                var paymentIntent = service.Create(options);

       
                responseData = new ItemResponse<Stripe.PaymentIntent> { Item = paymentIntent };

            }
            catch (Exception exception)
            {
                responseCode = 500;
                responseData = new ErrorResponse($"Generic Error: {exception.Message}");
                base.Logger.LogError(exception.ToString());
            }

            return StatusCode(responseCode, responseData);
        }

        #region Stripe
        private PaymentIntent CreateIntent(PaymentIntentCreateOptions options)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            options.Currency = "usd";
            var service = new PaymentIntentService();
            var paymentIntent = service.Create(options);

            return paymentIntent;
        }
        private Invoice GetStripeInvoice(string invoiceId)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            var service = new InvoiceService();
            var invoice = service.Get(invoiceId);
            return invoice;
        }
        private Customer CreateStripeCustomer(CustomerCreateOptions options)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            var service = new CustomerService();
            var customer = service.Create(options);
            return customer;
        }        
        private Customer UpdateStripeCustomer(string customerId, BillingDetails billingDetails)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            var options = new CustomerUpdateOptions
            {
                Name = billingDetails.Name,
                Email = billingDetails.Email,
            };
            var service = new CustomerService();
            var customer = service.Update(customerId, options);
            return customer;
        }        
        private PaymentMethod AttachStripePaymentMethod(string customerId, string paymentMethodId)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            var options = new PaymentMethodAttachOptions
            {
                Customer = customerId,
            };
            var service = new PaymentMethodService();
            var paymentMethod = service.Attach(
              paymentMethodId,
              options
            );
            return paymentMethod;
        }
        private StripeList<Price> GetStripePricesByProductId(string productId) 
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            var options = new PriceListOptions { Product = productId, Active = true };
            var service = new PriceService();
            var listOfPrices = service.List(options);
            return listOfPrices;
        }
        private Stripe.Subscription CreateStripeSubscription(StripeSubAddRequest request)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            var options = new SubscriptionCreateOptions
            {
                Customer = request.CustomerId,
                Items = new List<SubscriptionItemOptions>
                {
                    new SubscriptionItemOptions
                    {
                        Price = request.PriceId,
                    },
                },
                DefaultPaymentMethod = request.PaymentMethodId,
            };
            options.AddExpand("latest_invoice.payment_intent");
            var service = new SubscriptionService();
            var subscription = service.Create(options);
            return subscription;
        }
        private Stripe.Subscription UpdateStripeSubscriptionPlan(StripeSubUpdatePlanRequest request)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            var service = new SubscriptionService();
            Stripe.Subscription subscription = service.Get(request.SubscriptionId);

            var items = new List<SubscriptionItemOptions>
            {
                new SubscriptionItemOptions
                {
                    Id = subscription.Items.Data[0].Id,
                    Price = request.PriceId,
                }
            };

            var options = new SubscriptionUpdateOptions
            {
                Items = items,
            };
            options.AddExpand("latest_invoice.payment_intent");
            subscription = service.Update(request.SubscriptionId, options);
            return subscription;
        }
        private Stripe.Subscription UpdateStripeSubscriptionPayment(StripeSubUpdatePaymentRequest request)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            var service = new SubscriptionService();
            Stripe.Subscription subscription = service.Get(request.SubscriptionId);
            var items = new List<SubscriptionItemOptions>
            {
                new SubscriptionItemOptions
                {
                    Id = subscription.Items.Data[0].Id,
                }
            };
            var options = new SubscriptionUpdateOptions
            {
                DefaultPaymentMethod = request.PaymentMethodId,
                Items = items
            };
            options.AddExpand("latest_invoice.payment_intent");
            subscription = service.Update(request.SubscriptionId, options);
            return subscription;
        }
        private Stripe.Subscription GetStripeSubscription(string subscriptionId)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            var service = new SubscriptionService();
            var options = new SubscriptionGetOptions();
            options.AddExpand("default_payment_method");
            var subscription = service.Get(subscriptionId, options);
            return subscription;
        }
        private Stripe.Subscription CancelStripeSubscription(string subscriptionId)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;

            SubscriptionCancelOptions options = new SubscriptionCancelOptions();

            var service = new SubscriptionService();
            var subscription = service.Cancel(subscriptionId, options);
            return subscription;
        }
        private Stripe.Product CreateStripeProduct(string productName)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
            var options = new ProductCreateOptions
            {
                Name = productName,
            };
            var service = new ProductService();
            var product = service.Create(options);
            return product;
        }

        private Stripe.Price CreateStripeProductPrice(string productId, long price)
        {
            StripeConfiguration.ApiKey = _appKeys.StripeApiKey;
            var options = new PriceCreateOptions
            {
                UnitAmount = price,
                Currency = "usd",
                Product = productId,
            };
            var service = new PriceService();
            var stripePrice = service.Create(options);
            return stripePrice;
        }



        #endregion
    }
}