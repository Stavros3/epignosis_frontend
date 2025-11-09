import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';

export interface LoginCredentials {
	username: string;
	password: string;
}

interface AuthResponse {
	message: string;
	token: string;
	user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly http = inject(HttpClient);
	private readonly platformId = inject(PLATFORM_ID);
	private readonly storage = isPlatformBrowser(this.platformId) ? window.localStorage : null;

	private readonly TOKEN_KEY = 'epignosis_token';
	private readonly USER_KEY = 'epignosis_user';

	// Signals for state management
	private readonly _user = signal<User | null>(null);
	private readonly _token = signal<string | null>(null);
	private readonly _isLoading = signal<boolean>(false);
	private readonly _error = signal<string | null>(null);

	// Computed signals
	readonly user = this._user.asReadonly();
	readonly token = this._token.asReadonly();
	readonly isLoading = this._isLoading.asReadonly();
	readonly error = this._error.asReadonly();
	readonly isAuthenticated = computed(() => !!this._token());

	constructor() {
		const { token, user } = this.restoreAuthState();
		if (token) {
			this._token.set(token);
		}
		if (user) {
			this._user.set(user);
		}
	}

	login(credentials: LoginCredentials): Observable<User> {
		this._isLoading.set(true);
		this._error.set(null);

		return this.http
			.post<AuthResponse>(`${environment.apiUrl}/users/authenticate`, credentials)
			.pipe(
				tap(({ token, user }) => this.persistAuthState(token, user)),
				map(({ user }) => user),
				catchError((error) => this.handleError(error)),
				finalize(() => this._isLoading.set(false)),
			);
	}

	logout(): void {
		this.clearPersistedAuthState();
		this._error.set(null);
		this._isLoading.set(false);
	}

	hasToken(): boolean {
		return !!this._token();
	}

	clearError(): void {
		this._error.set(null);
	}

	private persistAuthState(token: string, user: User): void {
		this._token.set(token);
		this._user.set(user);

		if (this.storage) {
			this.storage.setItem(this.TOKEN_KEY, token);
			this.storage.setItem(this.USER_KEY, JSON.stringify(user));
		}
	}

	private clearPersistedAuthState(): void {
		this._token.set(null);
		this._user.set(null);

		if (this.storage) {
			this.storage.removeItem(this.TOKEN_KEY);
			this.storage.removeItem(this.USER_KEY);
		}
	}

	private restoreAuthState(): { token: string | null; user: User | null } {
		if (!this.storage) {
			return { token: null, user: null };
		}

		const token = this.storage.getItem(this.TOKEN_KEY);
		const rawUser = this.storage.getItem(this.USER_KEY);

		if (!rawUser) {
			return { token, user: null };
		}

		try {
			const user = JSON.parse(rawUser) as User;
			return { token, user };
		} catch {
			this.storage.removeItem(this.USER_KEY);
			return { token, user: null };
		}
	}

	private handleError(error: HttpErrorResponse): Observable<never> {
		const fallbackMessage = 'Unable to authenticate. Please try again.';
		const message =
			typeof error.error === 'string' && error.error
				? error.error
				: error.error?.message ?? error.message ?? fallbackMessage;

		this._error.set(message);
		return throwError(() => error);
	}
}
