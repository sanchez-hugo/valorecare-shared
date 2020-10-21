using Sabio.Models.Domain.Stripe;
using Sabio.Models.Requests;

namespace Sabio.Services
{
    public interface IStripeConnectService
    {
        int AddAccountId(int UserId, string AccountId);
        string GetAccountId(int UserId);
        StripeAppointmentCharge GetChargeByAppointmentId(int AppointmentId);
        StripeAppointmentCharge GetChargeByChargeId(string ChargeId);
        void AddStripeCharge(AppointmentChargeAddRequest request);
        void UpdateStripeChargeByAppointmentId(int AppointmentId, bool IsRefunded);
        void UpdateStripeChargeByChargeId(string ChargeId, bool IsRefunded);
        bool StateMatches(string state);
        void CancelAppointment(int AppointmentId, string reason);
        void DeleteAppointment(int id);
    }
}