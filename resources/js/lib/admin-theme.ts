import type { ThemeConfig } from 'antd';

export const adminTheme: ThemeConfig = {
    token: {
        colorPrimary: '#4d7563',
        colorText: '#263c31',
        colorBgLayout: '#f6f7f2',
        colorBorderSecondary: '#e5e9e1',
        borderRadius: 10,
        fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif",
    },
    components: {
        Layout: {
            bodyBg: '#f6f7f2',
            headerBg: '#fbfcf8',
            siderBg: '#1d3029',
        },
        Menu: {
            darkItemBg: '#1d3029',
            darkSubMenuItemBg: '#1d3029',
            darkItemColor: '#c4d2c8',
            darkItemHoverBg: '#2b4539',
            darkItemSelectedBg: '#496d5c',
            darkItemSelectedColor: '#ffffff',
            itemHeight: 46,
            itemBorderRadius: 10,
            itemMarginInline: 0,
        },
    },
};
