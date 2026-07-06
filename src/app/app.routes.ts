import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () =>
            import('./auth/login/login').then((c) => c.Login),
    },
    {
        path: 'dashboard',
        loadComponent: () =>
        import('./dashboard/dashboard').then((c) => c.Dashboard),
        canActivate: [authGuard],
    },
    {
        path: 'category',
        loadComponent: () =>
        import('./category/category').then((c) => c.Category),
        canActivate: [authGuard],
    },
    {
        path: 'attachment',
        loadComponent: () =>
        import('./attachment/attachment').then((c) => c.Attachment),
        canActivate: [authGuard],
    },
    {
        path: 'doc-type',
        loadComponent: () =>
        import('./doc-type/doc-type').then((c) => c.DocType),
        canActivate: [authGuard],
    },
    {
        path: 'admin',
        loadComponent: () =>
        import('./admin/admin').then((c) => c.Admin),
        canActivate: [authGuard],
    }
];
