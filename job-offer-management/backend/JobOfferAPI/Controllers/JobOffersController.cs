using Microsoft.AspNetCore.Mvc;
using JobOfferAPI.Models;
using JobOfferAPI.Services;
using System.ComponentModel.DataAnnotations;

namespace JobOfferAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobOffersController : ControllerBase
    {
        private readonly IJobOfferStorageService _storageService;
        private readonly IPdfService _pdfService;
        private readonly ILogger<JobOffersController> _logger;

        public JobOffersController(
            IJobOfferStorageService storageService,
            IPdfService pdfService,
            ILogger<JobOffersController> logger)
        {
            _storageService = storageService;
            _pdfService = pdfService;
            _logger = logger;
        }

        /// <summary>
        /// Generate a job offer PDF from form data
        /// </summary>
        [HttpPost("generate")]
        public async Task<ActionResult<ApiResponse<object>>> GenerateJobOffer([FromBody] JobOffer jobOffer)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    
                    return BadRequest(ApiResponse<object>.ErrorResult("Validation failed", errors));
                }

                // Save job offer
                await _storageService.SaveJobOfferAsync(jobOffer);

                // Generate PDF
                var pdfPath = await _pdfService.GeneratePdfAsync(jobOffer);
                
                // Update job offer with PDF path
                jobOffer.PdfPath = pdfPath;
                jobOffer.Status = "generated";
                await _storageService.UpdateJobOfferAsync(jobOffer);

                var pdfUrl = _pdfService.GetPdfUrl(pdfPath);

                _logger.LogInformation($"Job offer PDF generated successfully for {jobOffer.RecipientEmail}");

                return Ok(ApiResponse<object>.SuccessResult(new { pdfUrl }, "Job offer PDF generated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating job offer PDF");
                return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error occurred while generating PDF"));
            }
        }

        /// <summary>
        /// Get PDF preview URL
        /// </summary>
        [HttpGet("{offerId}/preview")]
        public async Task<ActionResult<ApiResponse<object>>> GetPreview(string offerId)
        {
            try
            {
                var jobOffer = await _storageService.GetJobOfferAsync(offerId);
                
                if (jobOffer == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResult("Job offer not found"));
                }

                if (string.IsNullOrEmpty(jobOffer.PdfPath))
                {
                    return BadRequest(ApiResponse<object>.ErrorResult("PDF not generated yet"));
                }

                var previewUrl = _pdfService.GetPdfUrl(jobOffer.PdfPath);

                return Ok(ApiResponse<object>.SuccessResult(new { previewUrl }, "Preview URL retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting PDF preview for offer {OfferId}", offerId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error occurred"));
            }
        }

        /// <summary>
        /// Get job offer history
        /// </summary>
        [HttpGet("history")]
        public async Task<ActionResult<ApiResponse<List<JobOffer>>>> GetHistory()
        {
            try
            {
                var jobOffers = await _storageService.GetAllJobOffersAsync();
                return Ok(ApiResponse<List<JobOffer>>.SuccessResult(jobOffers, "Job offer history retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving job offer history");
                return StatusCode(500, ApiResponse<List<JobOffer>>.ErrorResult("Internal server error occurred"));
            }
        }

        /// <summary>
        /// Get specific job offer
        /// </summary>
        [HttpGet("{offerId}")]
        public async Task<ActionResult<ApiResponse<JobOffer>>> GetJobOffer(string offerId)
        {
            try
            {
                var jobOffer = await _storageService.GetJobOfferAsync(offerId);
                
                if (jobOffer == null)
                {
                    return NotFound(ApiResponse<JobOffer>.ErrorResult("Job offer not found"));
                }

                return Ok(ApiResponse<JobOffer>.SuccessResult(jobOffer, "Job offer retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving job offer {OfferId}", offerId);
                return StatusCode(500, ApiResponse<JobOffer>.ErrorResult("Internal server error occurred"));
            }
        }
    }
}
