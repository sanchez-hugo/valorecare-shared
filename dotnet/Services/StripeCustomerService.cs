using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models.Domain;
using Sabio.Models.Domain.Stripe;
using Sabio.Models.Requests.Stripe;

namespace Sabio.Services
{
    public class StripeCustomerService : IStripeCustomerService
    {
        IDataProvider _data = null;
        public StripeCustomerService(IDataProvider data)
        {
            _data = data;
        }

        public string GetCustomerId(int UserId)
        {
            string customerId = "";

            string procName = "[dbo].[StripeCustomers_SelectByUserId]";

            _data.ExecuteCmd(procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@UserId", UserId);
                },
                delegate (IDataReader reader, short set)
                {
                    customerId = reader.GetSafeString(0);
                }
                );

            return customerId;
        }

        public int AddCustomerId(int UserId, string CustomerId)
        {

            string procName = "[dbo].[StripeCustomers_Insert]";
            int id = 0;

            _data.ExecuteNonQuery(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@UserId", UserId);
                    inputCollection.AddWithValue("@StripeCustomerId", CustomerId);

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

        public int GetRoleId(string Role)
        {
            // "Seeker" == 3
            // "Provider" == 2
            if (Role.ToLower() == "provider")
                return 2;
            else if (Role.ToLower() == "seeker")
                return 3;
            else return 0;
        }
        public string GetProductId(int RoleId)
        {
            string productId = "";

            string procName = "[dbo].[StripeProducts_SelectByRoleId]";

            _data.ExecuteCmd(procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@RoleId", RoleId);
                },
                delegate (IDataReader reader, short set)
                {
                    productId = reader.GetSafeString(0);
                }
                );

            return productId;
        }
        public int AddSubscription(SubscriptionAddRequest request)
        {
            int id = 0;
            string procName = "[dbo].[StripeSubscriptions_InsertV2]";

            _data.ExecuteNonQuery(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    AddSubscriptionInputs(request, inputCollection);

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
        public List<Subscription> GetSubscription(int UserId)
        {
            List<Subscription> list = null;

            string procName = "[dbo].[StripeSubscriptions_SelectByUserId]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@UserId", UserId);
                },
                delegate (IDataReader reader, short set)
                {

                    Subscription subscriptions = MapSubscription(reader);

                    if (list == null)
                        list = new List<Subscription>();
                    list.Add(subscriptions);
                }
                );

            return list;
        }
        public Subscription GetSubscriptionById(int Id)
        {
            Subscription subscription = null;

            string procName = "[dbo].[StripeSubscriptions_SelectById]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@Id", Id);
                },
                delegate (IDataReader reader, short set)
                {
                     subscription = MapSubscription(reader);
                }
                );

            return subscription;
        }
        public Subscription GetSubscriptionByUserId(int UserId)
        {
            Subscription subscription = null;

            string procName = "[dbo].[StripeSubscriptions_SelectByUserId]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@UserId", UserId);
                },
                delegate (IDataReader reader, short set)
                {
                     subscription = MapSubscription(reader);
                }
                );

            return subscription;
        }
        public void UpdateSubscription(SubscriptionAddRequest request)
        {
            string procname = "[dbo].[StripeSubscriptions_UpdateV2]";

            _data.ExecuteNonQuery(procname
             , delegate (SqlParameterCollection inputCollection)
             {
                 AddSubscriptionInputs(request, inputCollection);
             }, null
             );
        }

        public void UpdateSubscriptionStatus(string id, bool status, int userId)
        {
            string procname = "[dbo].[StripeSubscriptions_UpdateStatusV2]";

            _data.ExecuteNonQuery(procname
             , delegate (SqlParameterCollection inputCollection)
             {
                 inputCollection.AddWithValue("@SubscriptionId", id);
                 inputCollection.AddWithValue("@UserId", userId);
                 inputCollection.AddWithValue("@IsSubscriptionActive", status);
             }, null
             );
        }

        private static void AddSubscriptionInputs(SubscriptionAddRequest request, SqlParameterCollection inputCollection)
        {
            inputCollection.AddWithValue("@UserId", request.UserId);
            inputCollection.AddWithValue("@SubscriptionId", request.SubscriptionId);
            inputCollection.AddWithValue("@CustomerId", request.CustomerId);
            inputCollection.AddWithValue("@IsSubscriptionActive", request.IsSubscriptionActive);
            if (request.DateEnded != null)
                inputCollection.AddWithValue("@DateEnded", request.DateEnded);
        }
        private static Subscription MapSubscription(IDataReader reader)
        {

            int indexCounter = 0;
            Subscription sub = new Subscription();
            sub.Id = reader.GetSafeInt32(indexCounter++);
            sub.SubscriptionId = reader.GetSafeString(indexCounter++);

            #region SubscriptionUser
            sub.SubscriptionUser = new BaseUserProfile();
            sub.SubscriptionUser.UserId = reader.GetSafeInt32(indexCounter++);
            sub.SubscriptionUser.FirstName = reader.GetSafeString(indexCounter++);
            sub.SubscriptionUser.LastName = reader.GetSafeString(indexCounter++);
            sub.SubscriptionUser.Mi = reader.GetSafeString(indexCounter++);
            sub.SubscriptionUser.AvatarUrl = reader.GetSafeString(indexCounter++);
            #endregion

            sub.IsSubscriptionActive = reader.GetSafeBool(indexCounter++);
            sub.DateEnded = reader.GetSafeDateTimeNullable(indexCounter++);

            return sub;
        }
    }
}
