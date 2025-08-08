using JobOfferAPI.Models;
using System.Collections.Concurrent;

namespace JobOfferAPI.Services
{
    public class DocuSignService : IDocuSignService
    {
        private readonly ILogger<DocuSignService> _logger;
        private readonly IEmailService _emailService;
        
        // In-memory storage for simulation (in production, this would be a database)
        private static readonly ConcurrentDictionary<string, DocuSignEnvelope> _envelopes = new();

        public DocuSignService(ILogger<DocuSignService> logger, IEmailService emailService)
        {
            _logger = logger;
            _emailService = emailService;
        }

        public async Task<EnvelopeResponse> CreateAndSendEnvelopeAsync(JobOffer jobOffer, string pdfPath)
        {
            try
            {
                // Generate envelope ID
                var envelopeId = $"ENV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
                
                // Create envelope
                var envelope = new DocuSignEnvelope
                {
                    EnvelopeId = envelopeId,
                    Status = "sent",
                    RecipientEmail = jobOffer.RecipientEmail,
                    RecipientName = jobOffer.RecipientName,
                    DocumentName = $"Job_Offer_{jobOffer.JobTitle.Replace(" ", "_")}.pdf",
                    SentAt = DateTime.UtcNow
                };

                // Add initial status event
                envelope.StatusEvents.Add(new StatusEvent
                {
                    Status = "sent",
                    Message = "Envelope sent to recipient",
                    Timestamp = DateTime.UtcNow
                });

                // Store envelope
                _envelopes[envelopeId] = envelope;

                // Send email notification (simulated)
                await _emailService.SendJobOfferEmailAsync(jobOffer, envelopeId);

                // Start background status simulation
                _ = Task.Run(() => SimulateStatusUpdatesAsync(envelopeId));

                _logger.LogInformation($"DocuSign envelope created and sent: {envelopeId}");

                return new EnvelopeResponse
                {
                    EnvelopeId = envelopeId,
                    Status = "sent",
                    RecipientName = jobOffer.RecipientName,
                    RecipientEmail = jobOffer.RecipientEmail,
                    DocumentName = envelope.DocumentName,
                    SubmissionTimestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating DocuSign envelope for job offer {JobOfferId}", jobOffer.Id);
                throw;
            }
        }

        public async Task<string> GetEnvelopeStatusAsync(string envelopeId)
        {
            await Task.Delay(10); // Simulate async operation
            
            if (_envelopes.TryGetValue(envelopeId, out var envelope))
            {
                return envelope.Status;
            }
            
            throw new ArgumentException($"Envelope not found: {envelopeId}");
        }

        public async Task<DocuSignEnvelope?> GetEnvelopeDetailsAsync(string envelopeId)
        {
            await Task.Delay(10); // Simulate async operation
            
            _envelopes.TryGetValue(envelopeId, out var envelope);
            return envelope;
        }

        public async Task SimulateStatusUpdatesAsync(string envelopeId)
        {
            if (!_envelopes.TryGetValue(envelopeId, out var envelope))
                return;

            try
            {
                // Simulate status progression over time
                var statusUpdates = new[]
                {
                    new { Status = "delivered", Message = "Email delivered to recipient", DelaySeconds = 5 },
                    new { Status = "viewed", Message = "Recipient opened the document", DelaySeconds = 15 },
                    new { Status = "signed", Message = "Document signed by recipient", DelaySeconds = 30 },
                    new { Status = "completed", Message = "Signing process completed", DelaySeconds = 5 }
                };

                foreach (var update in statusUpdates)
                {
                    await Task.Delay(update.DelaySeconds * 1000);
                    
                    envelope.Status = update.Status;
                    envelope.StatusEvents.Add(new StatusEvent
                    {
                        Status = update.Status,
                        Message = update.Message,
                        Timestamp = DateTime.UtcNow
                    });

                    if (update.Status == "completed")
                    {
                        envelope.CompletedAt = DateTime.UtcNow;
                    }

                    _logger.LogInformation($"Envelope {envelopeId} status updated to: {update.Status}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error simulating status updates for envelope {EnvelopeId}", envelopeId);
            }
        }
    }
}
