import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import CustomerLayout from '@/layouts/customer-layout';
import { index as cartIndex } from '@/routes/cart';
import { login, register } from '@/routes/customer';
import { store as loginStore } from '@/routes/customer/login';
import { store as registerStore } from '@/routes/customer/register';

export default function AuthForm({ registering }: { registering: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const { errors: pageErrors } = usePage().props;
    const title = registering ? 'Daftar' : 'Masuk';
    const inputClassName =
        'rounded-lg border border-[#d7e3d6] bg-white px-3 py-3 font-normal';

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(registering ? registerStore.url() : loginStore.url(), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    }

    return (
        <CustomerLayout>
            <Head title={title} />
            <section className="mx-auto max-w-lg px-5 py-12 sm:px-8 sm:py-16">
                <h1 className="font-serif text-4xl text-[#263e30]">{title}</h1>
                <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
                    {pageErrors.cart && (
                        <p role="alert" className="text-sm text-red-700">
                            {pageErrors.cart}{' '}
                            <Link href={cartIndex()} className="underline">
                                Lihat keranjang
                            </Link>
                        </p>
                    )}
                    {registering && (
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Nama
                            <input
                                required
                                aria-invalid={Boolean(errors.name)}
                                aria-describedby={
                                    errors.name ? 'name-error' : undefined
                                }
                                autoComplete="name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                className={inputClassName}
                            />
                            {errors.name && (
                                <span
                                    id="name-error"
                                    role="alert"
                                    className="text-red-700"
                                >
                                    {errors.name}
                                </span>
                            )}
                        </label>
                    )}
                    <label className="flex flex-col gap-2 text-sm font-semibold">
                        Email
                        <input
                            required
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={
                                errors.email ? 'email-error' : undefined
                            }
                            type="email"
                            autoComplete="email"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            className={inputClassName}
                        />
                        {errors.email && (
                            <span
                                id="email-error"
                                role="alert"
                                className="text-red-700"
                            >
                                {errors.email}
                            </span>
                        )}
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-semibold">
                        Kata sandi
                        <input
                            required
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={
                                errors.password ? 'password-error' : undefined
                            }
                            type="password"
                            autoComplete={
                                registering
                                    ? 'new-password'
                                    : 'current-password'
                            }
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            className={inputClassName}
                        />
                        {errors.password && (
                            <span
                                id="password-error"
                                role="alert"
                                className="text-red-700"
                            >
                                {errors.password}
                            </span>
                        )}
                    </label>
                    {registering && (
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Konfirmasi kata sandi
                            <input
                                required
                                aria-invalid={Boolean(
                                    errors.password_confirmation,
                                )}
                                aria-describedby={
                                    errors.password_confirmation
                                        ? 'password-confirmation-error'
                                        : undefined
                                }
                                type="password"
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(event) =>
                                    setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                                className={inputClassName}
                            />
                            {errors.password_confirmation && (
                                <span
                                    id="password-confirmation-error"
                                    role="alert"
                                    className="text-red-700"
                                >
                                    {errors.password_confirmation}
                                </span>
                            )}
                        </label>
                    )}
                    <button
                        disabled={processing}
                        type="submit"
                        className="rounded-lg bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50"
                    >
                        {processing ? 'Memproses...' : title}
                    </button>
                </form>
                <p className="mt-6 text-sm text-[#617569]">
                    {registering ? 'Sudah punya akun? ' : 'Belum punya akun? '}
                    <Link
                        href={registering ? login() : register()}
                        className="font-semibold text-brand underline"
                    >
                        {registering ? 'Masuk' : 'Daftar'}
                    </Link>
                </p>
            </section>
        </CustomerLayout>
    );
}
