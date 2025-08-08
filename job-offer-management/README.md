# Job Offer Management System with DocuSign Integration

A comprehensive full-stack application for managing job offers and electronic signature processes, built with .NET Core backend and Angular frontend with real-time status tracking.

## 🚀 Features

### Frontend (Angular)
- **Modern Angular UI** - Component-based architecture with Angular 15+
- **Responsive Navigation** - Mobile-friendly navigation with Tailwind CSS
- **Form Validation** - Reactive forms with real-time validation
- **Routing** - Multi-page navigation (Home, Create Offer, PDF Preview, Status Tracker)
- **TypeScript** - Type-safe development experience
- **Component Architecture** - Modular, reusable components

### Backend API
- **PDF Generation** - Convert job offers to professional PDF documents
- **DocuSign Integration** - Complete envelope lifecycle simulation
- **Email Notifications** - Automated email sending (simulated)
- **Status Polling** - Real-time status updates with background processing
- **CORS Enabled** - Cross-origin requests supported
- **Swagger Documentation** - Complete API documentation

## 🛠 Technology Stack

### Frontend
- **Angular 15+** with TypeScript
- **Tailwind CSS** for styling
- **Reactive Forms** for form handling
- **Angular Router** for navigation
- **RxJS** for reactive programming
- **FontAwesome Icons**

### Backend
- **.NET Core 8.0** Web API
- **Entity Framework Core** (ready for SQL Server)
- **Swagger/OpenAPI** for documentation
- **In-memory storage** (production-ready for database integration)

## 📁 Project Structure

```
job-offer-management/
├── frontend/
│   ├── job-offer-frontend/                    # Angular Application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.component.html         # Main navigation layout
│   │   │   │   ├── app.component.ts           # Root component
│   │   │   │   ├── app-routing.module.ts      # Main routing configuration
│   │   │   │   ├── app.module.ts              # Root module
│   │   │   │   └── job-offer/                 # Job offer feature module
│   │   │   │       ├── job-offer.module.ts    # Feature module
│   │   │   │       ├── job-offer-routing.module.ts # Feature routing
│   │   │   │       ├── models/
│   │   │   │       │   └── job-offer.model.ts # Data models
│   │   │   │       ├── services/
│   │   │   │       │   └── job-offer.service.ts # API service
│   │   │   │       ├── offer-form/            # Create offer component
│   │   │   │       │   ├── offer-form.component.html
│   │   │   │       │   ├── offer-form.component.ts
│   │   │   │       │   └── offer-form.component.scss
│   │   │   │       ├── pdf-preview/           # PDF preview component
│   │   │   │       │   ├── pdf-preview.component.html
│   │   │   │       │   ├── pdf-preview.component.ts
│   │   │   │       │   └── pdf-preview.component.scss
│   │   │   │       └── status-tracker/        # Status tracking component
│   │   │   │           ├── status-tracker.component.html
│   │   │   │           ├── status-tracker.component.ts
│   │   │   │           └── status-tracker.component.scss
│   │   │   ├── assets/                        # Static assets
│   │   │   ├── styles.scss                    # Global styles
│   │   │   └── index.html                     # Entry point
│   │   ├── angular.json                       # Angular CLI configuration
│   │   ├── package.json                       # Dependencies
│   │   ├── tailwind.config.js                 # Tailwind configuration
│   │   └── tsconfig.json                      # TypeScript configuration
│   ├── job-offer-form.html                    # Legacy HTML version
│   ├── job-offer-api.js                       # Legacy JavaScript
│   └── Logo.jpg                               # Company logo
├── backend/
│   └── JobOfferAPI/
│       ├── Controllers/
│       │   ├── JobOffersController.cs          # Job offer management
│       │   └── DocuSignController.cs           # Signature workflows
│       ├── Services/
│       │   ├── PdfService.cs                  # PDF generation
│       │   ├── DocuSignService.cs             # DocuSign simulation
│       │   ├── EmailService.cs                # Email notifications
│       │   └── InMemoryJobOfferStorageService.cs
│       ├── Models/
│       │   ├── JobOffer.cs                    # Job offer data model
│       │   ├── DocuSignEnvelope.cs            # Envelope tracking
│       │   └── ApiResponse.cs                 # API response wrapper
│       └── Program.cs                         # Application startup
└── README.md                                  # This file
```

## 🚦 Getting Started

### Prerequisites
- **.NET 8.0 SDK** or later
- **Node.js 18+** and **npm**
- **Angular CLI** (`npm install -g @angular/cli`)
- **Modern web browser** (Chrome, Firefox, Edge, Safari)
- **Visual Studio 2022** or **Visual Studio Code** (optional)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd job-offer-management/backend/JobOfferAPI
   ```

2. **Restore dependencies:**
   ```bash
   dotnet restore
   ```

3. **Build the project:**
   ```bash
   dotnet build
   ```

4. **Run the API:**
   ```bash
   dotnet run
   ```

   The API will start at: `http://localhost:5000`

5. **View API Documentation:**
   Open `http://localhost:5000/swagger` in your browser

### Frontend Setup (Angular)

1. **Navigate to the Angular frontend directory:**
   ```bash
   cd job-offer-management/frontend/job-offer-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   ng serve
   ```
   
   Or if port 4200 is occupied:
   ```bash
   ng serve --port 4201
   ```

4. **Open the application:**
   - The app will be available at: `http://localhost:4200` (or `http://localhost:4201`)
   - The dev server will automatically reload when you make changes

## 🎯 Usage Guide

### Navigation
- **Home** - Overview/dashboard (currently shows offer form)
- **Create Offer** - Job offer creation form
- **PDF Preview** - Preview generated PDFs
- **Status Tracker** - Track signature status

### Creating a Job Offer

1. **Navigate to "Create Offer"**
2. **Fill out the form:**
   - Enter recipient's **full name** (required)
   - Enter recipient's **email address** (required, must be valid format)
   - Select **job title** and **department**
   - Enter **salary** and **start date**
   - Customize the **job offer content**

3. **Generate PDF:**
   - Click **"Generate Offer Letter"** button
   - System validates all fields and shows errors if any
   - PDF is generated and stored on the server

4. **Preview PDF:**
   - Click **"Preview PDF"** button
   - PDF opens in a new browser tab

5. **Send for Signature:**
   - Click **"Send for Signature"** button
   - Email notification sent to recipient (simulated)
   - Real-time status updates begin

## 🚨 Debugging & Troubleshooting

### Common Frontend Issues

#### 1. **Angular CLI Commands Not Working**
**Error:** `Error: This command is not available when running the Angular CLI outside a workspace.`

**Solution:**
```bash
# Make sure you're in the correct directory
cd job-offer-management/frontend/job-offer-frontend

# Then run Angular commands
ng serve --port 4201
```

#### 2. **Port Already in Use**
**Error:** `Port 4200 is already in use. Would you like to use a different port?`

**Solutions:**
```bash
# Option 1: Use a different port
ng serve --port 4201

# Option 2: Kill process using port 4200 (Windows)
netstat -ano | findstr :4200
taskkill /PID <PID_NUMBER> /F

# Option 3: Kill process using port 4200 (Mac/Linux)
lsof -ti:4200 | xargs kill -9
```

#### 3. **Compilation Errors**
**Check for errors:**
```bash
# Build to see compilation errors
ng build --configuration development

# Check for linting issues
ng lint
```

#### 4. **Module Not Found Errors**
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

#### 5. **Routing Issues**
**Check:**
- Verify `app-routing.module.ts` has correct routes
- Ensure `<router-outlet></router-outlet>` is present in `app.component.html`
- Check browser console for navigation errors

### Backend Debugging

#### 1. **API Not Starting**
```bash
# Check for port conflicts
netstat -ano | findstr :5000

# Check project compilation
dotnet build

# Run with detailed logging
dotnet run --verbosity diagnostic
```

#### 2. **CORS Issues**
**Check browser console for errors like:**
- `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:4200' has been blocked by CORS policy`

**Solution:** CORS is already configured in the backend, but verify:
- API is running on `http://localhost:5000`
- Frontend is making requests to the correct URL

### Development Workflow Debugging

#### 1. **Full Development Setup**
```bash
# Terminal 1 - Backend
cd job-offer-management/backend/JobOfferAPI
dotnet run

# Terminal 2 - Frontend
cd job-offer-management/frontend/job-offer-frontend
ng serve --port 4201
```

#### 2. **Check Services Are Running**
- Backend health check: `http://localhost:5000/health`
- Frontend: `http://localhost:4201`
- API documentation: `http://localhost:5000/swagger`

#### 3. **Browser Developer Tools**
- **Console tab:** Check for JavaScript errors
- **Network tab:** Monitor API calls and responses
- **Application tab:** Check local storage and session data

#### 4. **Angular DevTools**
Install Angular DevTools browser extension for better debugging:
- Component inspection
- Routing visualization
- Performance profiling

### Build and Deployment Issues

#### 1. **Production Build**
```bash
# Build for production
ng build --configuration production

# Test production build locally
ng serve --configuration production
```

#### 2. **Environment Configuration**
Update API URLs in environment files:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

## 📚 API Endpoints

### Job Offers Controller (`/api/joboffers`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | Generate PDF from job offer data |
| GET | `/{offerId}/preview` | Get PDF preview URL |
| GET | `/history` | Get all job offers |
| GET | `/{offerId}` | Get specific job offer |

### DocuSign Controller (`/api/docusign`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send` | Send offer for signature |
| GET | `/status/{envelopeId}` | Check signing status |
| GET | `/envelope/{envelopeId}` | Get envelope details |
| POST | `/webhook` | Handle DocuSign webhooks |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

## 🔧 Configuration

### Frontend Configuration

Update API base URL in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

### Backend Configuration

The API can be configured in `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

## 🧪 Testing

### Manual Testing

1. **Start both backend and frontend services**
2. **Navigate to** `http://localhost:4201`
3. **Test navigation:** Click through all menu items
4. **Test form:** Fill out job offer form with valid data
5. **Test validation:** Try submitting with invalid/empty fields
6. **Test API integration:** Generate PDF and send for signature

### Unit Testing

```bash
# Run Angular unit tests
ng test

# Run backend tests
dotnet test
```

### E2E Testing

```bash
# Run Angular e2e tests
ng e2e
```

## 🎨 Customization

### Styling
- Modify Tailwind CSS classes in component templates
- Update global styles in `src/styles.scss`
- Configure Tailwind in `tailwind.config.js`

### Adding New Components
```bash
# Generate new component
ng generate component job-offer/new-component

# Generate new service
ng generate service job-offer/services/new-service
```

## 🔜 Future Enhancements

### Planned Features
- **Database Integration** - SQL Server persistence
- **User Authentication** - JWT-based authentication
- **Template Library** - Multiple job offer templates
- **Advanced PDF Features** - Digital signatures, watermarks
- **Real DocuSign Integration** - Production DocuSign API
- **Email Service** - SendGrid integration
- **File Upload** - Attach additional documents
- **Audit Trail** - Complete activity logging
- **Progressive Web App** - PWA capabilities
- **Internationalization** - Multi-language support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, create an issue in the repository or contact the development team.

---

**Built with ❤️ for enterprise job offer management**