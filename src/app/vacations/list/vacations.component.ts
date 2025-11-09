import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ModalController, RefresherCustomEvent } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from 'src/app/auth/services/auth.service';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { VacationStatusEnum } from '../enums/vacation-status.enum';
import { Vacation } from '../models/vacation.model';
import { RequestVacationComponentModal } from '../request-vacation-modal/request-vacation-modal.component';
import { VacationsService } from '../services/vacations.service';

@Component({
  selector: 'app-vacations',
  templateUrl: './vacations.component.html',
  styleUrls: ['./vacations.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DatePipe,
    HeaderComponent,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonBadge,
    IonSelect,
    IonSelectOption,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonNote,
  ],
  providers: [ModalController],
})
export class VacationsComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly modalController = inject(ModalController);

  readonly vacationsService = inject(VacationsService);
  readonly authService = inject(AuthService);

  readonly isAdmin = computed(() => this.authService.user()?.roles_id === 1);

  readonly statusOptions = [
    { value: VacationStatusEnum.PENDING, label: 'Pending' },
    { value: VacationStatusEnum.APPROVED, label: 'Approved' },
    { value: VacationStatusEnum.REJECTED, label: 'Rejected' },
  ];

  constructor() {
    this.loadVacations();
  }

  loadVacations(): void {
    this.vacationsService
      .fetchVacations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => undefined });
  }

  async onRequestVacation(): Promise<void> {
    const modal = await this.modalController.create({
      component: RequestVacationComponentModal,
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75,
    });

    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'submitted') {
      this.loadVacations();
    }
  }

  onStatusChange(vacation: Vacation, status: VacationStatusEnum): void {
    if (status === vacation.status_id) {
      return;
    }

    this.vacationsService
      .updateVacationStatus(vacation.id, { status_id: status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => undefined });
  }

  onRefresh(event: RefresherCustomEvent): void {
    this.vacationsService
      .fetchVacations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => event.detail.complete(),
        error: () => event.detail.complete(),
      });
  }

  statusLabel(status: VacationStatusEnum): string {
    console.log(status);

    return this.statusOptions.find((option) => option.value === status)?.label ?? 'Unknown';
  }

  trackByVacationId(_index: number, vacation: Vacation): number {
    return vacation.id;
  }

  statusBadgeColor(status: VacationStatusEnum): string {
    switch (status) {
      case VacationStatusEnum.APPROVED:
        return 'success';
      case VacationStatusEnum.REJECTED:
        return 'danger';
      case VacationStatusEnum.PENDING:
      default:
        return 'warning';
    }
  }
}
