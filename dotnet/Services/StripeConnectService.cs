using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models.Domain.Stripe;
using Sabio.Models.Requests;

namespace Sabio.Services
{
    public class StripeConnectService : IStripeConnectService
    {
        IDataProvider _data = null;
        public StripeConnectService(IDataProvider data)
        {
            _data = data;
        }
        public string GetAccountId(int UserId)
        {
            string AccountId = "";

            string procName = "[dbo].[StripeAccounts_SelectByUserId]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@UserId", UserId);
                },
                delegate (IDataReader reader, short set)
                {
                    AccountId = reader.GetSafeString(0);
                }
                );

            return AccountId;
        }

        public int AddAccountId(int UserId, string AccountId)
        {

            string procName = "[dbo].[StripeAccounts_Insert]";
            int id = 0;

            _data.ExecuteNonQuery(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@UserId", UserId);
                    inputCollection.AddWithValue("@AccountId", AccountId);

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
        public void AddStripeCharge(AppointmentChargeAddRequest request)
        {
            string procName = "[dbo].[StripeAppointmentCharges_Insert]";

            _data.ExecuteNonQuery(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@AppointmentId", request.AppointmentId);
                    inputCollection.AddWithValue("@StripeChargeId", request.StripeChargeId);
                },
                null    
            );
        }
        public void UpdateStripeChargeByAppointmentId(int AppointmentId, bool IsRefunded)
        {
            string procname = "[dbo].[StripeAppointmentCharges_UpdateByAppointmentId]";

            _data.ExecuteNonQuery(procname
             , delegate (SqlParameterCollection inputCollection)
             {
                 inputCollection.AddWithValue("@AppointmentId", AppointmentId);
                 inputCollection.AddWithValue("@IsRefunded", IsRefunded);
             }, null
             );
        }
        public void UpdateStripeChargeByChargeId(string ChargeId, bool IsRefunded)
        {
            string procname = "[dbo].[StripeAppointmentCharges_UpdateByChargeId]";

            _data.ExecuteNonQuery(procname
             , delegate (SqlParameterCollection inputCollection)
             {
                 inputCollection.AddWithValue("@StripeChargeId", ChargeId);
                 inputCollection.AddWithValue("@IsRefunded", IsRefunded);
             }, null
             );
        }
        public StripeAppointmentCharge GetChargeByAppointmentId(int AppointmentId)
        {
            StripeAppointmentCharge charge = null;

            string procName = "[dbo].[StripeAppointmentCharges_SelectByAppointmentId]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@AppointmentId", AppointmentId);
                },
                delegate (IDataReader reader, short set)
                {
                    charge = MapStripeAppointmentCharge(reader);
                }
                );

            return charge;
        }
        public StripeAppointmentCharge GetChargeByChargeId(string ChargeId)
        {
            StripeAppointmentCharge charge = null;

            string procName = "[dbo].[StripeAppointmentCharges_SelectByChargeId]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@StripeChargeId", ChargeId);
                },
                delegate (IDataReader reader, short set)
                {
                    charge = MapStripeAppointmentCharge(reader);
                }
                );

            return charge;
        }
        public void CancelAppointment(int AppointmentId, string reason)
        {
            string procName = "[dbo].[Appointments_UpdateCancellationStatus]";
            _data.ExecuteNonQuery(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@isCanceled", true);
                    inputCollection.AddWithValue("@CancellationReason", reason);
                    inputCollection.AddWithValue("@Id", AppointmentId);
                },
                null);
        }
        public void DeleteAppointment(int id)
        {
            string procName = "[dbo].[Appointments_DeleteById_V2]";
            _data.ExecuteNonQuery(procName,
           inputParamMapper: delegate (SqlParameterCollection col)
           {
               col.AddWithValue("@Id", id);
           },
           returnParameters: null);
        }
        private static StripeAppointmentCharge MapStripeAppointmentCharge(IDataReader reader)
        {
            int indexCounter = 0;
            StripeAppointmentCharge charge = new StripeAppointmentCharge();
            charge.AppointmentId = reader.GetSafeInt32(indexCounter++);
            charge.StripeChargeId = reader.GetSafeString(indexCounter++);
            charge.IsRefunded = reader.GetSafeBool(indexCounter++);
            return charge;
        }
        public bool StateMatches(string state)
        {
            // STATE should be randomly generated elsewhere
            //var savedState = "{{ STATE }}"; 
            //return savedState == stateParameter;

            if (true)
                return true;
        }
    }
}
