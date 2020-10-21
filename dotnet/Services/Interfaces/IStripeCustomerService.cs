using System.Collections.Generic;
using Sabio.Models.Domain.Stripe;
using Sabio.Models.Requests.Stripe;

namespace Sabio.Services
{
    public interface IStripeCustomerService
    {
        int AddCustomerId(int UserId, string CustomerId);
        string GetCustomerId(int UserId);
        int GetRoleId(string role);
        string GetProductId(int RoleId);
        int AddSubscription(SubscriptionAddRequest request);
        List<Subscription> GetSubscription(int UserId);
        Subscription GetSubscriptionById(int Id);
        void UpdateSubscription(SubscriptionAddRequest request);
        Subscription GetSubscriptionByUserId(int UserId);
        void UpdateSubscriptionStatus(string id, bool status, int userId);
    }
}