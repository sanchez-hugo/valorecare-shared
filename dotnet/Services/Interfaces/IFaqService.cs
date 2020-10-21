using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Domain.Faq;
using Sabio.Models.Requests.Faq;
using System.Collections.Generic;

namespace Sabio.Services
{
    public interface IFaqService
    {
        int Add(FaqAddRequest request, int userId);
        Paged<Faq> GetByCreatedBy(int PageIndex, int PageSize, int CreatedBy);
        public List<Faq> Get();

        Faq GetById(int Id);
        void Update(FaqUpdateRequest request, int userId);
       void Delete(int Id);
        public Faq GetAll(int categoryId);
        //public List<Faq> GetAllByCategory(int categoryId);
        public List<FaqCategory> GetCategories();









    }
}