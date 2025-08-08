using JobOfferAPI.Models;

namespace JobOfferAPI.Services
{
    public interface IDocuSignService
    {
        Task<EnvelopeResponse> CreateAndSendEnvelopeAsync(JobOffer jobOffer, string pdfPath);
        Task<string> GetEnvelopeStatusAsync(string envelopeId);
        Task<DocuSignEnvelope?> GetEnvelopeDetailsAsync(string envelopeId);
        Task SimulateStatusUpdatesAsync(string envelopeId);
    }
}
