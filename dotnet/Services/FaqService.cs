using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Domain.Faq;
using Sabio.Models.Domain.LookUp;
using Sabio.Models.Requests.Faq;

namespace Sabio.Services
{
    public class FaqService : IFaqService
    {
        IDataProvider _data = null;
        public FaqService(IDataProvider data)
        {
            _data = data;
        }
        //public List<Faq> GetAllByCategory(int categoryId)
        //{
          

        //    List<Faq> result = null;

        //    int totalCount = 0;

        //    _data.ExecuteCmd(
        //      "[dbo].[Faqs_SelectAllDetails_Unpaginated]",
        //       inputParamMapper: delegate (SqlParameterCollection parameterCollection)

        //       {
        //           parameterCollection.AddWithValue("@categoryId", categoryId);
               

        //       },
        //      singleRecordMapper: delegate (IDataReader reader, short set)
        //      {
        //          Faq faq = MapFaq(reader);


        //          if (totalCount == 0)
        //          {

        //              totalCount = reader.GetSafeInt32(14);
        //          }

        //          if (result == null)
        //          {
        //              result = new List<Faq>();
        //          }

        //          result.Add(faq);
        //      }
        //      );
        //    //);
        //    //  if (result != null)
        //    //  {
        //    //      pagedResult = new Paged<Post>(result, currentPage, itemsPerPage, totalCount);
        //    //  }

        //    return result;

        //}

        public Faq GetAll(int categoryId)
        {

            string procName = "[dbo].[Faqs_SelectAllDetails_Unpaginated]";

            Faq faq = null;


            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramCollection)
            {

                paramCollection.AddWithValue("@categoryId", categoryId);

            }, delegate (IDataReader reader, short set)

            {

                faq = MapFaq(reader);

            }

            );

            return faq;
        }
        public List<FaqCategory> GetCategories()
        {
            List<FaqCategory> list = null;
            string procName = "[dbo].[Faq_Categories_SelectAll]";

            _data.ExecuteCmd(procName, inputParamMapper: null
                , singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    FaqCategory aFaq = new FaqCategory();

                    int startingIndex = 0;

                    aFaq.Id = reader.GetSafeInt32(startingIndex++);
                    aFaq.Name = reader.GetSafeString(startingIndex++);


                    if (list == null)
                    {
                        list = new List<FaqCategory>();
                    }
                    list.Add(aFaq);
                });


            return list;

        }

        public List<Faq> Get()
        {
            List<Faq> list = null;
                            string procName = "[dbo].[Faqs_SelectAll_Unpaginated]";

            _data.ExecuteCmd(procName, inputParamMapper: null
                , singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    Faq aFaq = MapFaq(reader);

                    if (list == null)
                    {
                        list = new List<Faq>();
                    }
                    list.Add(aFaq);
                });
              

            return list;

        }
        public Paged<Faq> GetByCreatedBy(int PageIndex, int PageSize, int CreatedBy)
        {
            Paged<Faq> pagedList = null;
            List<Faq> list = null;
            int totalCount = 0;

            string procName = "[dbo].[Faqs_SelectAllDetails_Providers]";

            _data.ExecuteCmd(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@PageIndex", PageIndex);
                    inputCollection.AddWithValue("@PageSize", PageSize);
                    inputCollection.AddWithValue("@CreatedBy", CreatedBy);
                },
                delegate (IDataReader reader, short set)
                {

                    Faq faq = MapFaq(reader);
                    if (totalCount == 0)
                        totalCount = reader.GetSafeInt32(LastColumn);

                    if (list == null)
                        list = new List<Faq>();
                    list.Add(faq);
                }
                );

            if (list != null)
                pagedList = new Paged<Faq>(list, PageIndex, PageSize, totalCount);

            return pagedList;
        }
        public Faq GetById(int Id)
        {
            Faq faq = null;

            string procName = "[dbo].[Faqs_Select_ByIdV2]";

            _data.ExecuteCmd(procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    inputCollection.AddWithValue("@Id", Id);
                },
                delegate (IDataReader reader, short set)
                {
                    faq = MapFaq(reader);
                }
                );

            return faq;
        }
        public int Add(FaqAddRequest request, int userId)
        {
            string procName = "[dbo].[Faqs_Insert]";
            int id = 0;

            _data.ExecuteNonQuery(
                procName,
                delegate (SqlParameterCollection inputCollection)
                {
                    FaqAddInputs(request, inputCollection, userId);
                    inputCollection.AddWithValue("@CreatedBy", userId);

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
        public void Update(FaqUpdateRequest request, int userId)
        {
            string procname = "[dbo].[Faqs_Update]";

            _data.ExecuteNonQuery(procname
             , delegate (SqlParameterCollection inputCollection)
             {
                 FaqAddInputs(request, inputCollection, userId);
                 inputCollection.AddWithValue("@Id", request.Id);
             }, null
             );
        }

        public void Delete(int Id)
        {
            string procname = "[dbo].[Faqs_Delete_ById]";

            _data.ExecuteNonQuery(procname
             , delegate (SqlParameterCollection inputCollection)
             {
                 inputCollection.AddWithValue("@Id", Id);
             }, null
             );
        }
        private static int LastColumn = 0;
        private static Faq MapFaq(IDataReader reader)
        {
            int indexCounter = 0;
            Faq faq = new Faq();
            faq.Id = reader.GetSafeInt32(indexCounter++);
            faq.Question = reader.GetSafeString(indexCounter++);
            faq.Answer = reader.GetSafeString(indexCounter++);

            faq.Category = new TwoColumn();
            faq.Category.Id = reader.GetSafeInt32(indexCounter++);
            faq.Category.Name = reader.GetSafeString(indexCounter++);
            
            faq.SortOrder = reader.GetSafeInt32(indexCounter++);
            faq.DateCreated = reader.GetSafeDateTime(indexCounter++);
            faq.DateModified = reader.GetSafeDateTime(indexCounter++);

            faq.CreatedBy = new BaseUserProfile();
            faq.CreatedBy.UserId = reader.GetSafeInt32(indexCounter++);
            faq.CreatedBy.FirstName = reader.GetSafeString(indexCounter++);
            faq.CreatedBy.LastName = reader.GetSafeString(indexCounter++);
            
            faq.ModifiedBy = new BaseUserProfile();
            faq.ModifiedBy.UserId = reader.GetSafeInt32(indexCounter++);
            faq.ModifiedBy.FirstName = reader.GetSafeString(indexCounter++);
            faq.ModifiedBy.LastName = reader.GetSafeString(indexCounter++);

            if (LastColumn == 0) LastColumn = indexCounter;

            return faq;
        }
        private static void FaqAddInputs(FaqAddRequest request, SqlParameterCollection inputCollection, int userId)
        {
            inputCollection.AddWithValue("@Question", request.Question);
            inputCollection.AddWithValue("@Answer", request.Answer);
            inputCollection.AddWithValue("@CategoryId", request.CategoryId);
            inputCollection.AddWithValue("@SortOrder", request.SortOrder);
            inputCollection.AddWithValue("@ModifiedBy", userId);
        }
    }
}
