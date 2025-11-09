import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, Input, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { UserModel } from '../users/models/user.model';
import { CreateUserPayload, UpdateUserPayload, UsersService } from '../users/services/user.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
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
    IonInput,
    IonNote,
    IonSpinner,
  ],
})
export class CreateUserComponent {
  private _mode: 'create' | 'edit' = 'create';
  private _initialUser: UserModel | null = null;
  private isFormReady = false;

  @Input()
  set mode(value: 'create' | 'edit') {
    this._mode = value ?? 'create';
    this.applyInitialValues();
  }
  get mode(): 'create' | 'edit' {
    return this._mode;
  }

  @Input()
  set initialUser(value: UserModel | null) {
    this._initialUser = value;
    this.applyInitialValues();
  }
  get initialUser(): UserModel | null {
    return this._initialUser;
  }

  private readonly fb = inject(FormBuilder);
  private readonly modalController = inject(ModalController);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  readonly state = {
    isSubmitting: this.usersService.isSubmitting,
    error: this.usersService.error,
  };

  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    employ_code: this.fb.nonNullable.control('', Validators.required),
    username: this.fb.nonNullable.control('', Validators.required),
    password: this.fb.control('', []),
  });

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.usersService.clearError());

    this.isFormReady = true;
    this.applyInitialValues();
  }

  dismiss(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  onSubmit(): void {
    if (this.mode === 'edit' && !this.initialUser) {
      return;
    }

    this.updatePasswordValidator();

    const { name, email, employ_code, username, password } = this.form.getRawValue();
    const sanitized = {
      name: (name ?? '').trim(),
      email: (email ?? '').trim(),
      employ_code: String(employ_code ?? '').trim(),
      username: (username ?? '').trim(),
      password: (password ?? '').trim(),
    };

    this.form.patchValue(
      {
        name: sanitized.name,
        email: sanitized.email,
        employ_code: sanitized.employ_code,
        username: sanitized.username,
        password: sanitized.password,
      },
      { emitEvent: false }
    );

    this.form.updateValueAndValidity({ emitEvent: false });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const numericCode = Number(sanitized.employ_code);

    if (!sanitized.employ_code || Number.isNaN(numericCode)) {
      this.form.controls.employ_code.setErrors({ number: true });
      this.form.controls.employ_code.markAsTouched();
      return;
    }

    let request$: Observable<UserModel>;

    if (this.mode === 'create') {
      const createPayload: CreateUserPayload = {
        name: sanitized.name,
        email: sanitized.email,
        username: sanitized.username,
        password: sanitized.password,
        employ_code: numericCode,
      };
      request$ = this.usersService.createUser(createPayload);
    } else {
      const updatePayload: UpdateUserPayload = {
        name: sanitized.name,
        email: sanitized.email,
        username: sanitized.username,
        employ_code: numericCode,
      };

      if (sanitized.password) {
        updatePayload.password = sanitized.password;
      }

      request$ = this.usersService.updateUser(this.initialUser!.id, updatePayload);
    }

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async () => {
          this.form.reset();
          this.applyInitialValues();
          const role = this.mode === 'create' ? 'created' : 'updated';
          await this.modalController.dismiss(null, role);
        },
        error: () => undefined,
      });
  }

  showError(controlName: 'name' | 'email' | 'username' | 'employ_code' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private applyInitialValues(): void {
    if (!this.isFormReady) {
      return;
    }

    this.updatePasswordValidator();

    if (this.mode === 'edit' && this.initialUser) {
      this.form.patchValue({
        name: this.initialUser.name,
        email: this.initialUser.email,
        employ_code: String(this.initialUser.employ_code ?? ''),
        username: this.initialUser.username,
        password: '',
      });
    } else {
      this.form.reset({ name: '', email: '', employ_code: '', username: '', password: '' });
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.form.controls.password.updateValueAndValidity({ emitEvent: false });

    this.usersService.clearError();
  }

  private updatePasswordValidator(): void {
    const passwordControl = this.form.controls.password;
    const validators =
      this.mode === 'create'
        ? [Validators.required, Validators.minLength(6)]
        : [this.optionalMinLengthValidator(6)];
    passwordControl.setValidators(validators);
    passwordControl.updateValueAndValidity({ emitEvent: false });
  }

  private optionalMinLengthValidator(length: number): ValidatorFn {
    return (control: AbstractControl<string | null>) => {
      const value = control.value ?? '';
      if (value.length === 0) {
        return null;
      }

      return value.length >= length
        ? null
        : { minlength: { requiredLength: length, actualLength: value.length } };
    };
  }
}
