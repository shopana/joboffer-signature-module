import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferFormComponent } from './offer-form/offer-form.component';
import { PdfPreviewComponent } from './pdf-preview/pdf-preview.component';
import { StatusTrackerComponent } from './status-tracker/status-tracker.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: OfferFormComponent, // For now, show the form as home page
    data: { showWelcome: true }
  },
  {
    path: 'offer-form',
    component: OfferFormComponent
  },
  {
    path: 'pdf-preview',
    component: PdfPreviewComponent
  },
  {
    path: 'status-tracker',
    component: StatusTrackerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobOfferRoutingModule { }
