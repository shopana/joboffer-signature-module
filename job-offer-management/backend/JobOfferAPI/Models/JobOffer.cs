using System.ComponentModel.DataAnnotations;

namespace JobOfferAPI.Models
{
    public class JobOffer
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string RecipientName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string RecipientEmail { get; set; } = string.Empty;
        
        [Required]
        public string JobTitle { get; set; } = string.Empty;
        
        [Required]
        public string Department { get; set; } = string.Empty;
        
        [Required]
        [Range(1, double.MaxValue)]
        public decimal Salary { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public string OfferContent { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "draft";
        public string? PdfPath { get; set; }
        public string? EnvelopeId { get; set; }
    }
}
