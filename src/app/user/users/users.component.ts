import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AlertController, ModalController, RefresherCustomEvent } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { CreateUserComponent } from '../create-user/create-user.component';
import { UserModel } from './models/user.model';
import { UsersService } from './services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButtons,
    IonButton,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonNote,
  ],
  providers: [ModalController, AlertController],
})
export class UsersComponent {
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly modalController = inject(ModalController);
  private readonly alertController = inject(AlertController);

  readonly state = {
    users: this.usersService.users,
    isLoading: this.usersService.isLoading,
    isSubmitting: this.usersService.isSubmitting,
    error: this.usersService.error,
    hasUsers: this.usersService.hasUsers,
  };

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService
      .loadUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => undefined });
  }

  onRefresh(event: RefresherCustomEvent): void {
    this.usersService
      .loadUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => event.detail.complete(),
        error: () => event.detail.complete(),
      });
  }

  async onCreate(): Promise<void> {
    await this.presentModal('create');
  }

  async onEdit(user: UserModel): Promise<void> {
    await this.presentModal('edit', user);
  }

  async onDelete(user: UserModel): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete User',
      message: `Are you sure you want to delete <strong>${user.name}</strong>?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteUser(user.id),
        },
      ],
    });

    await alert.present();
  }

  trackByUserId(_index: number, user: UserModel): number {
    return user.id;
  }

  private deleteUser(id: number): void {
    this.usersService
      .deleteUser(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadUsers(),
        error: () => undefined,
      });
  }

  private async presentModal(mode: 'create' | 'edit', user?: UserModel): Promise<void> {
    const modal = await this.modalController.create({
      component: CreateUserComponent,
      componentProps: {
        mode,
        initialUser: user ?? null,
      },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75,
    });

    await modal.present();

    const { role } = await modal.onDidDismiss();

    if (role === 'created' || role === 'updated') {
      this.loadUsers();
    }
  }
}
