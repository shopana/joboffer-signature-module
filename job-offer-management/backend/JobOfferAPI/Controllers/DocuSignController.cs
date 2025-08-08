using Microsoft.AspNetCore.Mvc;
using JobOfferAPI.Models;
using JobOfferAPI.Services;

namespace JobOfferAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocuSignController : ControllerBase
    {
        private readonly IJobOfferStorageService _storageService;
        private readonly IDocuSignService _docuSignService;
        private readonly ILogger<DocuSignController> _logger;

        public DocuSignController(
            IJobOfferStorageService storageService,
            IDocuSignService docuSignService,
            ILogger<DocuSignController> logger)
        {
            _storageService = storageService;
            _docuSignService = docuSignService;
            _logger = logger;
        }

        /// <summary>
        /// Send job offer for signature via DocuSign
        /// </summary>
        [HttpPost("send")]
        public async Task<ActionResult<ApiResponse<EnvelopeResponse>>> SendForSignature([FromBody] EnvelopeRequest request)
        {
            try
            {
                var jobOffer = await _storageService.GetJobOfferAsync(request.OfferId);
                
                if (jobOffer == null)
                {
                    return NotFound(ApiResponse<EnvelopeResponse>.ErrorResult("Job offer not found"));
                }

                if (string.IsNullOrEmpty(jobOffer.PdfPath))
                {
                    return BadRequest(ApiResponse<EnvelopeResponse>.ErrorResult("PDF not generated yet. Please generate the PDF first."));
                }

                // Create and send envelope
                var envelopeResponse = await _docuSignService.CreateAndSendEnvelopeAsync(jobOffer, jobOffer.PdfPath);

                // Update job offer status
                jobOffer.Status = "sent";
                jobOffer.EnvelopeId = envelopeResponse.EnvelopeId;
                await _storageService.UpdateJobOfferAsync(jobOffer);

                _logger.LogInformation($"Job offer sent for signature. Envelope ID: {envelopeResponse.EnvelopeId}");

                return Ok(ApiResponse<EnvelopeResponse>.SuccessResult(envelopeResponse, "Job offer sent for signature successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending job offer for signature");
                return StatusCode(500, ApiResponse<EnvelopeResponse>.ErrorResult("Internal server error occurred while sending for signature"));
            }
        }

        /// <summary>
        /// Check signing status of an envelope
        /// </summary>
        [HttpGet("status/{envelopeId}")]
        public async Task<ActionResult<ApiResponse<object>>> CheckSigningStatus(string envelopeId)
        {
            try
            {
                var status = await _docuSignService.GetEnvelopeStatusAsync(envelopeId);
                
                return Ok(ApiResponse<object>.SuccessResult(new { status }, "Envelope status retrieved successfully"));
            }
            catch (ArgumentException ex)
            {
                return NotFound(ApiResponse<object>.ErrorResult(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking envelope status for {EnvelopeId}", envelopeId);
                return StatusCode(500, ApiResponse<object>.ErrorResult("Internal server error occurred"));
            }
        }

        /// <summary>
        /// Get detailed envelope information
        /// </summary>
        [HttpGet("envelope/{envelopeId}")]
        public async Task<ActionResult<ApiResponse<DocuSignEnvelope>>> GetEnvelopeDetails(string envelopeId)
        {
            try
            {
                var envelope = await _docuSignService.GetEnvelopeDetailsAsync(envelopeId);
                
                if (envelope == null)
                {
                    return NotFound(ApiResponse<DocuSignEnvelope>.ErrorResult("Envelope not found"));
                }

                return Ok(ApiResponse<DocuSignEnvelope>.SuccessResult(envelope, "Envelope details retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving envelope details for {EnvelopeId}", envelopeId);
                return StatusCode(500, ApiResponse<DocuSignEnvelope>.ErrorResult("Internal server error occurred"));
            }
        }

        /// <summary>
        /// Webhook endpoint for DocuSign status updates (simulated)
        /// </summary>
        [HttpPost("webhook")]
        public async Task<ActionResult> HandleWebhook([FromBody] object webhookData)
        {
            try
            {
                // In a real implementation, this would process DocuSign webhook events
                _logger.LogInformation($"DocuSign webhook received: {webhookData}");
                
                // TODO: Process webhook data and update envelope status
                await Task.Delay(10); // Simulate async processing
                
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing DocuSign webhook");
                return StatusCode(500);
            }
        }
    }
}
