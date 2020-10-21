using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Domain.Coordinates;
using Sabio.Models.Requests;
using Sabio.Models.Requests.Locations;

namespace Sabio.Services.Interfaces
{
    public interface ILocationsService
    {
        void Update(LocationUpdateRequest model, int userId);

        Location Get(int id);       
        Paged<Location> Pagination(int pageIndex, int pageSize);
        Paged<Location> Search(int pageIndex, int pageSize, string query);
        public Paged<Location> PagedCreate(int pageIndex, int pageSize, int CreatedBy);
        public Paged<Location> PagedGeo(int Latitude, int Longitude, int Radius);
        void Delete(int id);
        int Create(LocationAddRequest model, int userId);
        Coordinates GetByZip(string zip);
    }
}