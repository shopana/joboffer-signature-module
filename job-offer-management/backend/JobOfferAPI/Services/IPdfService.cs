using JobOfferAPI.Models;

namespace JobOfferAPI.Services
{
    public interface IPdfService
    {
        Task<string> GeneratePdfAsync(JobOffer jobOffer);
        Task<byte[]> GetPdfBytesAsync(string pdfPath);
        string GetPdfUrl(string pdfPath);
    }
}
