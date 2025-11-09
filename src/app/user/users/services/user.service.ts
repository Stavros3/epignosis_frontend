import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserModel } from '../models/user.model';

interface AdminUsersResponse {
	message: string;
	users: UserModel[];
}

export interface CreateUserPayload {
	name: string;
	email: string;
	username: string;
	password: string;
	employ_code: number;
}

export interface UpdateUserPayload {
	name?: string;
	email?: string;
	username?: string;
	password?: string;
	employ_code?: number;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
	private readonly http = inject(HttpClient);

		private readonly _users = signal<UserModel[]>([]);
	private readonly _isLoading = signal<boolean>(false);
	private readonly _isSubmitting = signal<boolean>(false);
	private readonly _error = signal<string | null>(null);

	readonly users = this._users.asReadonly();
	readonly isLoading = this._isLoading.asReadonly();
	readonly isSubmitting = this._isSubmitting.asReadonly();
	readonly error = this._error.asReadonly();
	readonly hasUsers = computed(() => this._users().length > 0);

	loadUsers(): Observable<UserModel[]> {
		this._isLoading.set(true);
		this._error.set(null);

		return this.http.get<AdminUsersResponse>(`${environment.apiUrl}/users/admin`).pipe(
			map((response) => response.users ?? []),
			tap((users) => this._users.set(users)),
			catchError((error) => this.handleError(error)),
			finalize(() => this._isLoading.set(false)),
		);
	}

	createUser(payload: CreateUserPayload): Observable<UserModel> {
		this._isSubmitting.set(true);
		this._error.set(null);

		return this.http.post<UserModel>(`${environment.apiUrl}/users/store`, payload).pipe(
			tap((user) => this._users.update((current) => [user, ...current])),
			catchError((error) => this.handleError(error)),
			finalize(() => this._isSubmitting.set(false)),
		);
	}

	updateUser(id: number, payload: UpdateUserPayload): Observable<UserModel> {
		this._isSubmitting.set(true);
		this._error.set(null);

		return this.http.patch<UserModel>(`${environment.apiUrl}/users/${id}`, payload).pipe(
			tap((user) => {
				this._users.update((current) => current.map((item) => (item.id === id ? { ...item, ...user } : item)));
			}),
			catchError((error) => this.handleError(error)),
			finalize(() => this._isSubmitting.set(false)),
		);
	}

	deleteUser(id: number): Observable<void> {
		this._isSubmitting.set(true);
		this._error.set(null);

		return this.http.delete<void>(`${environment.apiUrl}/users/${id}`).pipe(
			tap(() => {
				this._users.update((current) => current.filter((user) => user.id !== id));
			}),
			catchError((error) => this.handleError(error)),
			finalize(() => this._isSubmitting.set(false)),
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
