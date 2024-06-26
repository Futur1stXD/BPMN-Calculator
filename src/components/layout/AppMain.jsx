import React from "react";
import { Layout } from "antd";
import { useMediaQuery } from "@uidotdev/usehooks";

import AppHeader from "./AppHeader";
import AppContent from "./AppContent";
import AppFooter from "./AppFooter";

function AppMain() {
    const isPhone = useMediaQuery("only screen and (max-width : 768px)");
    const isTablet = useMediaQuery("only screen and (min-width : 769px) and (max-width : 992px)");

    return (
        <Layout style={{ backgroundColor: 'white' }}>
            <AppHeader isPhone={isPhone} isTablet={isTablet} />
            <AppContent isPhone={isPhone} isTablet={isTablet} />
            <AppFooter isPhone={isPhone} />
        </Layout>
    );
}

export default AppMain;