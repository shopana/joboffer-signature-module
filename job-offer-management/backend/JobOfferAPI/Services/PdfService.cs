using JobOfferAPI.Models;
using System.Text;

namespace JobOfferAPI.Services
{
    public class PdfService : IPdfService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<PdfService> _logger;

        public PdfService(IWebHostEnvironment environment, ILogger<PdfService> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public async Task<string> GeneratePdfAsync(JobOffer jobOffer)
        {
            try
            {
                // Create wwwroot/pdfs directory if it doesn't exist
                var pdfsDirectory = Path.Combine(_environment.WebRootPath ?? "wwwroot", "pdfs");
                Directory.CreateDirectory(pdfsDirectory);

                // Generate filename
                var fileName = $"job_offer_{jobOffer.Id}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.html";
                var filePath = Path.Combine(pdfsDirectory, fileName);

                // Generate HTML content (simulating PDF)
                var htmlContent = GenerateHtmlContent(jobOffer);

                // Save HTML file (in a real scenario, this would be a PDF)
                await File.WriteAllTextAsync(filePath, htmlContent);

                _logger.LogInformation($"PDF generated successfully: {fileName}");
                return filePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF for job offer {JobOfferId}", jobOffer.Id);
                throw;
            }
        }

        public async Task<byte[]> GetPdfBytesAsync(string pdfPath)
        {
            if (!File.Exists(pdfPath))
            {
                throw new FileNotFoundException("PDF file not found", pdfPath);
            }

            return await File.ReadAllBytesAsync(pdfPath);
        }

        public string GetPdfUrl(string pdfPath)
        {
            var fileName = Path.GetFileName(pdfPath);
            return $"/pdfs/{fileName}";
        }

        private string GenerateHtmlContent(JobOffer jobOffer)
        {
            var content = jobOffer.OfferContent
                .Replace("[Candidate's Name]", jobOffer.RecipientName)
                .Replace("[Position Title]", jobOffer.JobTitle)
                .Replace("[Company Name]", "Your Company")
                .Replace("[Start Date]", jobOffer.StartDate.ToString("MMMM dd, yyyy"))
                .Replace("[Amount]", $"${jobOffer.Salary:N0}")
                .Replace("[Department]", jobOffer.Department)
                .Replace("[Remote / Office / Hybrid]", "Office")
                .Replace("[Deadline]", DateTime.Now.AddDays(7).ToString("MMMM dd, yyyy"));

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Job Offer - {jobOffer.JobTitle}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4F46E5;
        }}
        .company-logo {{
            font-size: 24px;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 10px;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .signature-section {{
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }}
        .signature-line {{
            border-bottom: 1px solid #333;
            width: 300px;
            margin: 20px 0 10px 0;
            height: 20px;
        }}
        .date {{
            color: #666;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class='header'>
        <div class='company-logo'>Zenithr</div>
        <div class='date'>Generated on {DateTime.Now:MMMM dd, yyyy}</div>
    </div>
    
    <div class='content'>
        {content.Replace("\n", "<br>").Replace("\r", "")}
    </div>
    
    <div class='signature-section'>
        <p><strong>Candidate Signature:</strong></p>
        <div class='signature-line'></div>
        <p>Date: _________________</p>
        
        <p style='margin-top: 40px;'><strong>Company Representative:</strong></p>
        <div class='signature-line'></div>
        <p>Date: _________________</p>
    </div>
</body>
</html>";
        }
    }
}
