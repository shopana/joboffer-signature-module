using JobOfferAPI.Models;
using System.Collections.Concurrent;

namespace JobOfferAPI.Services
{
    public class InMemoryJobOfferStorageService : IJobOfferStorageService
    {
        private static readonly ConcurrentDictionary<string, JobOffer> _jobOffers = new();
        private readonly ILogger<InMemoryJobOfferStorageService> _logger;

        public InMemoryJobOfferStorageService(ILogger<InMemoryJobOfferStorageService> logger)
        {
            _logger = logger;
        }

        public async Task<JobOffer> SaveJobOfferAsync(JobOffer jobOffer)
        {
            await Task.Delay(10); // Simulate async operation
            
            jobOffer.CreatedAt = DateTime.UtcNow;
            jobOffer.UpdatedAt = DateTime.UtcNow;
            
            _jobOffers[jobOffer.Id] = jobOffer;
            
            _logger.LogInformation($"Job offer saved: {jobOffer.Id}");
            return jobOffer;
        }

        public async Task<JobOffer?> GetJobOfferAsync(string id)
        {
            await Task.Delay(10); // Simulate async operation
            
            _jobOffers.TryGetValue(id, out var jobOffer);
            return jobOffer;
        }

        public async Task<List<JobOffer>> GetAllJobOffersAsync()
        {
            await Task.Delay(10); // Simulate async operation
            
            return _jobOffers.Values.OrderByDescending(jo => jo.CreatedAt).ToList();
        }

        public async Task<JobOffer> UpdateJobOfferAsync(JobOffer jobOffer)
        {
            await Task.Delay(10); // Simulate async operation
            
            if (!_jobOffers.ContainsKey(jobOffer.Id))
            {
                throw new ArgumentException($"Job offer not found: {jobOffer.Id}");
            }
            
            jobOffer.UpdatedAt = DateTime.UtcNow;
            _jobOffers[jobOffer.Id] = jobOffer;
            
            _logger.LogInformation($"Job offer updated: {jobOffer.Id}");
            return jobOffer;
        }

        public async Task<bool> DeleteJobOfferAsync(string id)
        {
            await Task.Delay(10); // Simulate async operation
            
            var removed = _jobOffers.TryRemove(id, out _);
            
            if (removed)
            {
                _logger.LogInformation($"Job offer deleted: {id}");
            }
            
            return removed;
        }
    }
}
