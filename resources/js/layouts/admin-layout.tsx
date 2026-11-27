import {
    AppstoreOutlined,
    DashboardOutlined,
    LogoutOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Avatar,
    Breadcrumb,
    Button,
    ConfigProvider,
    Dropdown,
    Layout,
    Menu,
} from 'antd';
import idID from 'antd/locale/id_ID';
import type { ReactNode } from 'react';
import { adminTheme } from '@/lib/admin-theme';
import {
    customers,
    dashboard,
    employees,
    logout,
    orders,
    products,
    variantAttributes,
} from '@/routes/admin';

type Props = {
    children: ReactNode;
    section: AdminSection;
};

const sectionLabels = {
    dashboard: 'Dashboard',
    employees: 'Employees',
    customers: 'Customers',
    products: 'Product & Variant',
    'variant-attributes': 'Variant Attribute',
    orders: 'Orders',
} as const;

export type AdminSection = keyof typeof sectionLabels;

const productSections = ['products', 'variant-attributes'];

export default function AdminLayout({ children, section }: Props) {
    const { auth } = usePage().props;

    return (
        <ConfigProvider locale={idID} theme={adminTheme}>
            <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
                <Layout.Sider
                    breakpoint="lg"
                    collapsedWidth="0"
                    width={240}
                    zeroWidthTriggerStyle={{ top: 18 }}
                >
                    <div className="flex items-center gap-3 px-6 pt-8 pb-10">
                        <div>
                            <div className="font-serif text-xl font-semibold text-[#f4f7ed]">
                                Example
                            </div>
                            <div className="mt-1 text-sm text-[#c4d2c8]">
                                Admin workspace
                            </div>
                        </div>
                    </div>
                    <div className="px-6 pb-3 text-sm font-semibold text-[#c4d2c8]">
                        Workspace
                    </div>
                    <Menu
                        theme="dark"
                        mode="inline"
                        style={{ padding: '0 12px', border: 0 }}
                        selectedKeys={[section]}
                        defaultOpenKeys={
                            productSections.includes(section) ? ['product'] : []
                        }
                        items={[
                            {
                                key: 'dashboard',
                                icon: <DashboardOutlined />,
                                label: (
                                    <Link href={dashboard()}>Dashboard</Link>
                                ),
                            },
                            {
                                key: 'employees',
                                icon: <UserOutlined />,
                                label: (
                                    <Link href={employees()}>Employees</Link>
                                ),
                            },
                            {
                                key: 'customers',
                                icon: <TeamOutlined />,
                                label: (
                                    <Link href={customers()}>Customers</Link>
                                ),
                            },
                            {
                                key: 'product',
                                icon: <AppstoreOutlined />,
                                label: 'Product',
                                children: [
                                    {
                                        key: 'products',
                                        label: (
                                            <Link href={products()}>
                                                Product &amp; Variant
                                            </Link>
                                        ),
                                    },
                                    {
                                        key: 'variant-attributes',
                                        label: (
                                            <Link href={variantAttributes()}>
                                                Variant Attribute
                                            </Link>
                                        ),
                                    },
                                ],
                            },
                            {
                                key: 'orders',
                                icon: <ShoppingCartOutlined />,
                                label: <Link href={orders()}>Orders</Link>,
                            },
                        ]}
                    />
                </Layout.Sider>
                <Layout>
                    <Layout.Header
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            height: 76,
                            lineHeight: 'normal',
                            padding: '0 24px',
                            borderBottom: '1px solid #e5e9e1',
                        }}
                    >
                        <div className="ml-12 min-w-0 flex-1 overflow-x-auto whitespace-nowrap lg:ml-0">
                            <Breadcrumb
                                className="[&_ol]:flex-nowrap"
                                items={[
                                    ...(section === 'dashboard'
                                        ? []
                                        : [
                                              {
                                                  title: (
                                                      <Link href={dashboard()}>
                                                          Dashboard
                                                      </Link>
                                                  ),
                                              },
                                          ]),
                                    ...(productSections.includes(section)
                                        ? [{ title: 'Product' }]
                                        : []),
                                    {
                                        title: (
                                            <span aria-current="page">
                                                {sectionLabels[section]}
                                            </span>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                        <div className="flex max-w-[45%] min-w-0 items-center gap-3">
                            <div className="min-w-0 text-right">
                                <div className="truncate text-sm font-semibold text-[#2e4639]">
                                    {auth.user?.name}
                                </div>
                                <div className="mt-1 truncate text-xs text-[#596f60]">
                                    {auth.user?.email}
                                </div>
                            </div>
                            <Dropdown
                                trigger={['hover', 'click']}
                                placement="bottomRight"
                                menu={{
                                    items: [
                                        {
                                            key: 'logout',
                                            icon: <LogoutOutlined />,
                                            label: 'Log out',
                                            onClick: () =>
                                                router.post(logout.url()),
                                        },
                                    ],
                                }}
                            >
                                <Button
                                    type="text"
                                    shape="circle"
                                    size="large"
                                    aria-label="Profile menu"
                                    className="shrink-0"
                                    icon={
                                        <Avatar
                                            src={auth.user?.avatar}
                                            icon={<UserOutlined />}
                                            style={{
                                                backgroundColor: '#dce9dd',
                                                color: '#426a55',
                                            }}
                                        />
                                    }
                                />
                            </Dropdown>
                        </div>
                    </Layout.Header>
                    <Layout.Content className="px-6 pt-6 pb-8 pl-[72px] lg:pb-10 lg:pl-6">
                        {children}
                    </Layout.Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
