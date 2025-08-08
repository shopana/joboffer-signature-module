using JobOfferAPI.Models;

namespace JobOfferAPI.Services
{
    public interface IJobOfferStorageService
    {
        Task<JobOffer> SaveJobOfferAsync(JobOffer jobOffer);
        Task<JobOffer?> GetJobOfferAsync(string id);
        Task<List<JobOffer>> GetAllJobOffersAsync();
        Task<JobOffer> UpdateJobOfferAsync(JobOffer jobOffer);
        Task<bool> DeleteJobOfferAsync(string id);
    }
}
