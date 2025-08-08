namespace JobOfferAPI.Models
{
    public class DocuSignEnvelope
    {
        public string EnvelopeId { get; set; } = string.Empty;
        public string Status { get; set; } = "created";
        public string RecipientEmail { get; set; } = string.Empty;
        public string RecipientName { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SentAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<StatusEvent> StatusEvents { get; set; } = new List<StatusEvent>();
    }

    public class StatusEvent
    {
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class EnvelopeRequest
    {
        public string OfferId { get; set; } = string.Empty;
    }

    public class EnvelopeResponse
    {
        public string EnvelopeId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string RecipientName { get; set; } = string.Empty;
        public string RecipientEmail { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string SubmissionTimestamp { get; set; } = string.Empty;
    }
}
