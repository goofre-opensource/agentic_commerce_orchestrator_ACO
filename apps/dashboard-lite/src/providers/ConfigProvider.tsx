"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type BrandingConfig = {
    agencyName: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
};

const defaultConfig: BrandingConfig = {
    agencyName: "Goofre Lite SaaS",
    primaryColor: "blue-600",
    secondaryColor: "gray-800",
};

const ConfigContext = createContext<{
    config: BrandingConfig;
    setConfig: (config: BrandingConfig) => void;
}>({
    config: defaultConfig,
    setConfig: () => { },
});

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<BrandingConfig>(defaultConfig);

    return (
        <ConfigContext.Provider value={{ config, setConfig }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useBrandingConfig() {
    return useContext(ConfigContext);
}
