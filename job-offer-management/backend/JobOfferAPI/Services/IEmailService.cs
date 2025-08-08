using JobOfferAPI.Models;

namespace JobOfferAPI.Services
{
    public interface IEmailService
    {
        Task SendJobOfferEmailAsync(JobOffer jobOffer, string envelopeId);
        Task SendStatusUpdateEmailAsync(string recipientEmail, string status, string envelopeId);
    }
}
