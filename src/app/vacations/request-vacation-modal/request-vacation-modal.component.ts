import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { VacationsService } from '../services/vacations.service';

@Component({
  selector: 'app-request-vacation',
  templateUrl: './request-vacation-modal.component.html',
  styleUrls: ['./request-vacation-modal.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    IonTextarea,
    IonNote,
    IonSpinner,
  ],
  providers: [ModalController],
})
export class RequestVacationComponentModal {
  private readonly fb = inject(FormBuilder);
  private readonly modalController = inject(ModalController);
  private readonly destroyRef = inject(DestroyRef);

  readonly vacationsService = inject(VacationsService);

  readonly form = this.fb.group({
    date_from: this.fb.control<string | undefined>(undefined, Validators.required),
    date_to: this.fb.control<string | undefined>(undefined, Validators.required),
    reason: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
  });

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.vacationsService.clearError();
        this.validateDateRange();
      });
  }

  dismiss(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  onSubmit(): void {
    if (this.form.invalid || this.form.controls.date_to.hasError('dateRange')) {
      this.form.markAllAsTouched();
      return;
    }

    const { date_from, date_to, reason } = this.form.getRawValue();

    if (!date_from || !date_to) {
      this.form.markAllAsTouched();
      return;
    }

    this.vacationsService
      .requestVacation({ date_from, date_to, reason })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async () => {
          this.form.reset({ date_from: undefined, date_to: undefined, reason: '' });
          await this.modalController.dismiss(null, 'submitted');
        },
        error: () => undefined,
      });
  }

  showError(controlName: 'date_from' | 'date_to' | 'reason'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private validateDateRange(): void {
  const fromValue = this.form.controls.date_from.value;
  const toValue = this.form.controls.date_to.value;

    const fromDate = fromValue ? new Date(fromValue) : null;
    const toDate = toValue ? new Date(toValue) : null;

    const datesAreValid =
      fromDate !== null &&
      toDate !== null &&
      !Number.isNaN(fromDate.getTime()) &&
      !Number.isNaN(toDate.getTime());

    if (datesAreValid && fromDate && toDate && toDate < fromDate) {
      this.form.controls.date_to.setErrors({ ...(this.form.controls.date_to.errors ?? {}), dateRange: true });
    } else if (this.form.controls.date_to.hasError('dateRange')) {
      const { dateRange, ...rest } = this.form.controls.date_to.errors ?? {};
      this.form.controls.date_to.setErrors(Object.keys(rest).length ? rest : null);
    }
  }
}
