import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { JobOfferRoutingModule } from './job-offer-routing.module';
import { OfferFormComponent } from './offer-form/offer-form.component';
import { PdfPreviewComponent } from './pdf-preview/pdf-preview.component';
import { StatusTrackerComponent } from './status-tracker/status-tracker.component';


@NgModule({
  declarations: [
    OfferFormComponent,
    PdfPreviewComponent,
    StatusTrackerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    JobOfferRoutingModule
  ]
})
export class JobOfferModule { }
