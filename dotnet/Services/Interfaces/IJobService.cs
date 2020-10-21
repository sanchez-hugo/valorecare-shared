using Sabio.Models;
using Sabio.Models.Domain.Job;
using Sabio.Models.Requests.Job;

namespace Sabio.Services
{
    public interface IJobService
    {
        int Add(JobAddRequest request, int userId);
        void Delete(int Id);
        Paged<Job> Get(int PageIndex, int PageSize);
        Paged<Job> GetByCreatedBy(int PageIndex, int PageSize, int CreatedBy);
        Paged<JobWithDistance> SearchNearby(string Query, int PageIndex, int PageSize, double Radius, string Zip);
        Job GetById(int Id);
        void Update(JobUpdateRequest request, int id);
        Paged<JobWithDistance> GetNearby(int PageIndex, int PageSize, double Radius, string Zip);
        Paged<Job> SearchByCreatedBy(string Query, int PageIndex, int PageSize, int CreatedBy);
    }
}