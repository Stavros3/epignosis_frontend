import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { VacationStatusEnum } from '../enums/vacation-status.enum';
import { Vacation } from '../models/vacation.model';

export interface CreateVacationPayload {
  date_from: string;
  date_to: string;
  reason: string;
}

export interface UpdateVacationStatusPayload {
  status_id: VacationStatusEnum;
}

@Injectable({ providedIn: 'root' })
export class VacationsService {
  private readonly http = inject(HttpClient);

  private readonly _vacations = signal<Vacation[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isSubmitting = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly vacations = this._vacations.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isSubmitting = this._isSubmitting.asReadonly();
  readonly error = this._error.asReadonly();
  readonly hasVacations = computed(() => this._vacations().length > 0);

  fetchVacations(): Observable<Vacation[]> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<Vacation[]>(`${environment.apiUrl}/vacations`).pipe(
      map((vacations) => vacations ?? []),
      tap((vacations) => this._vacations.set(vacations)),
      catchError((error) => this.handleError(error)),
      finalize(() => this._isLoading.set(false)),
    );
  }

  requestVacation(payload: CreateVacationPayload): Observable<Vacation> {
    this._isSubmitting.set(true);
    this._error.set(null);

    payload.date_from = payload.date_from.split('T')[0];
    payload.date_to = payload.date_to.split('T')[0];

    return this.http.post<Vacation>(`${environment.apiUrl}/vacations`, payload).pipe(
      catchError((error) => this.handleError(error)),
      finalize(() => this._isSubmitting.set(false)),
      tap((vacation) => this._vacations.update((current) => [vacation, ...current])),
    );
  }

  updateVacationStatus(id: number, payload: UpdateVacationStatusPayload): Observable<Vacation> {
    this._isSubmitting.set(true);
    this._error.set(null);

    return this.http.put<Vacation>(`${environment.apiUrl}/vacations/${id}`, payload).pipe(
      catchError((error) => this.handleError(error)),
      finalize(() => this._isSubmitting.set(false)),
      tap((vacation) => {
        this._vacations.update((current) =>
          current.map((item) => (item.id === id ? { ...item, ...vacation } : item)),
        );
      }),
    );
  }

  clearError(): void {
    this._error.set(null);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const fallbackMessage = 'Something went wrong. Please try again later.';
    const message =
      typeof error.error === 'string' && error.error
        ? error.error
        : error.error?.message ?? error.message ?? fallbackMessage;

    this._error.set(message);
    return throwError(() => error);
  }
}
