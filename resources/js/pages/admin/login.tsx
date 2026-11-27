import { Head, useForm } from '@inertiajs/react';
import { Button, ConfigProvider, Form, Input } from 'antd';
import enUS from 'antd/locale/en_US';
import { adminTheme } from '@/lib/admin-theme';
import { store } from '@/routes/admin/login';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    return (
        <ConfigProvider locale={enUS} theme={adminTheme}>
            <Head title="Admin Login" />
            <main className="flex min-h-screen items-center justify-center bg-[#f6f7f2] px-6 py-10">
                <div className="grid w-full max-w-[880px] overflow-hidden rounded-3xl border border-[#e4e9e1] bg-surface shadow-[0_12px_40px_rgba(39,70,49,0.08)] md:grid-cols-2">
                    <div className="flex flex-col gap-8 bg-[#1d3029] p-8 sm:p-10 md:justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <div className="font-serif text-xl font-semibold text-[#f4f7ed]">
                                    Example
                                </div>
                                <div className="mt-1 text-sm text-[#c4d2c8]">
                                    Admin workspace
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="max-w-xs font-serif text-3xl leading-tight tracking-tight text-[#f4f7ed] sm:text-4xl">
                                Manage your store.
                            </p>
                        </div>
                    </div>
                    <div className="p-8 sm:p-10">
                        <h1 className="font-serif text-3xl tracking-tight text-[#234535]">
                            Admin Login
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-[#596f60]">
                            Sign in with your employee account.
                        </p>
                        <div className="mt-8">
                            <Form
                                layout="vertical"
                                onFinish={() =>
                                    post(store.url(), {
                                        onFinish: () => reset('password'),
                                    })
                                }
                            >
                                <Form.Item
                                    label="Email"
                                    htmlFor="email"
                                    validateStatus={
                                        errors.email ? 'error' : undefined
                                    }
                                    help={errors.email}
                                >
                                    <Input
                                        id="email"
                                        type="email"
                                        size="large"
                                        autoComplete="username"
                                        value={data.email}
                                        onChange={(event) =>
                                            setData('email', event.target.value)
                                        }
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Password"
                                    htmlFor="password"
                                    validateStatus={
                                        errors.password ? 'error' : undefined
                                    }
                                    help={errors.password}
                                >
                                    <Input.Password
                                        id="password"
                                        size="large"
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(event) =>
                                            setData(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={processing}
                                    size="large"
                                    block
                                >
                                    Sign in
                                </Button>
                            </Form>
                        </div>
                    </div>
                </div>
            </main>
        </ConfigProvider>
    );
}
