declare var __webpack_init_sharing__;
declare var __webpack_share_scopes__;
declare var window;

import { ApolloProvider } from "@apollo/client";
import { AppProvider } from "./appContext";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "@erxes/ui/src/components/ErrorBoundary";
import { IUser } from "modules/auth/types";
import { NavItem } from "modules/layout/components/QuickNavigation";
import React from "react";
import { __ } from "coreui/utils";
import apolloClient from "@erxes/ui/src/apolloClient";
import { createRoot } from "react-dom/client";

const PLUGIN_LABEL_COLORS: string[] = [
  "",
  "#63D2D6", // CYAN
  "#E91E63", // PINK
  "#9C27B0", // PURPLE
  "#673AB7", // DEEP PURPLE
  "#3F51B5", // INDIGO
  "#2196F3", // BLUE
  "#00BCD4", // CYAN
  "#009688", // TEAL
  "#4CAF50", // GREEN
  "#8BC34A", // LIGHT GREEN
  "#CDDC39", // LIME
  "#FFC107", // AMBER
  "#FF9800", // ORANGE
  "#FF5722", // DEEP ORANGE
];

class CustomComponent extends React.Component<
  { scope: string; component: any; isTopNav?: boolean },
  { showComponent: boolean }
> {
  constructor(props) {
    super(props);

    this.state = { showComponent: false };
  }

  componentDidMount() {
    const interval = setInterval(() => {
      if (window[this.props.scope]) {
        window.clearInterval(interval);

        this.setState({ showComponent: true });
      }
    }, 500);
  }

  renderComponent = () => {
    if (!this.state.showComponent) {
      return null;
    }

    const { scope, component } = this.props;

    const Component = React.lazy(loadComponent(scope, component));

    return (
      <React.Suspense fallback="">
        <Component />
      </React.Suspense>
    );
  };

  render() {
    if (this.props.isTopNav) {
      return <NavItem>{this.renderComponent()}</NavItem>;
    }

    return this.renderComponent();
  }
}

const PluginsWrapper = ({
  itemName,
  callBack,
  plugins,
}: {
  itemName: string;
  callBack: (plugin: any, item: any) => React.ReactNode;
  plugins: any;
}) => {
  return (plugins || []).map((plugin) => {
    const item = plugin[itemName];

    if (!item) {
      return undefined;
    }

    return callBack(plugin, item);
  });
};

const useDynamicScript = (args) => {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!args.url) {
      return;
    }

    const element = document.createElement("script");
    const id = `dynamic-script-${args.scope}`;

    element.src = args.url;
    element.id = id;
    element.type = "text/javascript";
    element.async = true;

    setReady(false);
    setFailed(false);

    element.onload = () => {
      console.debug(`Dynamic Script Loaded: ${args.url}`);
      setReady(true);
    };

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${args.url}`, args);
      setReady(false);
      setFailed(true);
    };

    document.head.appendChild(element);

    return () => {
      console.debug(`Dynamic Script Removed: ${args.url}`);
      document.head.removeChild(element);
    };
  }, [args.url]);

  return {
    ready,
    failed,
  };
};

export const loadComponent = (scope, module) => {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await __webpack_init_sharing__("default");

    const container = window[scope]; // or get the container somewhere else

    try {
      // Initialize the container, it may provide shared modules
      await container.init(__webpack_share_scopes__.default);
    } catch (e) {
      console.error("Container initialization error:", e);
    }

    try {
      const factory = await window[scope]?.get(module);

      if (!factory) {
        throw new Error(`Module '${module}' not found in scope '${scope}'.`);
      }

      if (typeof factory !== "function") {
        throw new Error(`Factory is not a function for module '${module}'.`);
      }

      const Module = factory();

      if (!Module) {
        throw new Error(`Module '${module}' is not initialized properly.`);
      }
      return Module;
    } catch (error) {
      console.error("Component loading error:", error);
      throw error; // rethrow the error to let the caller handle it
    }
  };
};

const System = (props) => {
  if (props.loadScript) {
    const { ready, failed } = useDynamicScript({
      url: props.system && props.system.url,
      scope: props.system.scope,
    });

    if (!props.system || !ready || failed) {
      return null;
    }
  }

  const Component = React.lazy(
    loadComponent(props.system.scope, props.system.module)
  );

  return (
    <ErrorBoundary pluginName={props.pluginName}>
      <React.Suspense fallback="">
        <Component />
      </React.Suspense>
    </ErrorBoundary>
  );
};

const SystemWithApolloProvider = (props) => {
  if (props.loadScript) {
    const { ready, failed } = useDynamicScript({
      url: props.system && props.system.url,
      scope: props.system.scope,
    });

    if (!props.system || !ready || failed) {
      return null;
    }
  }

  const Component = React.lazy(
    loadComponent(props.system.scope, props.system.module)
  );

  return (
    <ErrorBoundary pluginName={props.pluginName}>
      <React.Suspense fallback="">
        <ApolloProvider client={apolloClient}>
          <AppProvider>
            <Component />
          </AppProvider>
        </ApolloProvider>
      </React.Suspense>
    </ErrorBoundary>
  );
};

class SettingsCustomBox extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = { showComponent: false };
  }

  renderComponent = () => {
    if (!this.state.showComponent) {
      return null;
    }

    const { scope, component } = this.props.settingsNav;

    const Component = React.lazy(loadComponent(scope, component));

    return (
      <React.Suspense fallback="">
        <Component />
      </React.Suspense>
    );
  };

  load = () => {
    this.setState({ showComponent: true });
  };

  render() {
    const { renderBox, settingsNav, color, hasComponent } = this.props;

    const box = renderBox(
      settingsNav.text,
      settingsNav.image,
      settingsNav.to,
      settingsNav.action,
      settingsNav.permissions,
      settingsNav.scope,
      color
    );

    if (settingsNav.component && hasComponent) {
      return (
        <div onClick={this.load}>
          {this.renderComponent()}
          {box}
        </div>
      );
    }

    return box;
  }
}

export const pluginsSettingsNavigations = (
  renderBox: (
    name: string,
    image: string,
    to: string,
    action: string,
    permissions?: string[],
    type?: string
  ) => React.ReactNode
) => {
  const plugins: any[] = (window as any).plugins || [];
  const navigationMenus: any[] = [];

  for (let i = 0; i < plugins.length; i++) {
    if (i >= PLUGIN_LABEL_COLORS.length) {
      plugins[i].color = PLUGIN_LABEL_COLORS[i - PLUGIN_LABEL_COLORS.length];
    } else {
      plugins[i].color = PLUGIN_LABEL_COLORS[i];
    }

    const hasComponent = Object.keys(plugins[i].exposes).includes("./settings");

    for (const menu of plugins[i].menus || []) {
      if (menu.location === "settings") {
        navigationMenus.push(
          <React.Fragment key={menu.text}>
            <SettingsCustomBox
              settingsNav={menu}
              color={plugins[i].color}
              renderBox={renderBox}
              hasComponent={hasComponent}
            />
          </React.Fragment>
        );
      }
    }
  }

  return navigationMenus;
};

export const pluginsOfTopNavigations = () => {
  const plugins: any[] = (window as any).plugins || [];
  const topNavigationMenus: any[] = [];

  for (const plugin of plugins) {
    for (const menu of plugin.menus || []) {
      if (menu.location === "topNavigation") {
        topNavigationMenus.push(
          <React.Fragment key={menu.text}>
            <CustomComponent
              scope={menu.scope}
              component={menu.component}
              isTopNav={true}
            />
          </React.Fragment>
        );
      }
    }
  }

  return topNavigationMenus;
};

export const pluginLayouts = (currentUser: IUser) => {
  const plugins: any[] = (window as any).plugins || [];
  const layouts: any[] = [];

  for (const plugin of plugins) {
    if (plugin.layout) {
      layouts.push(
        <System
          key={Math.random()}
          loadScript={true}
          system={plugin.layout}
          currentUser={currentUser}
          pluginName={plugin.name}
        />
      );
    }
  }

  return layouts;
};

export const pluginsInnerWidgets = () => {
  const plugins: any[] = (window as any).plugins || [];
  const rootDiv = document.getElementById("root");
  const newDiv = document.createElement("div");
  newDiv.style.cssText =
    "position:absolute;width:72px;z-index:999999;height:72px;display:flex;align-items:center;justify-content:center;";

  for (const plugin of plugins) {
    if (!plugin.innerWidget) {
      continue;
    }

    newDiv.style.cssText =
      newDiv.style.cssText + (plugin.innerWidget.style || "");

    createRoot(newDiv).render(
      <BrowserRouter>
        <SystemWithApolloProvider
          key={Math.random()}
          loadScript={true}
          system={plugin.innerWidget}
          pluginName={plugin.name}
        />
      </BrowserRouter>
    );
  }

  if (rootDiv) {
    document.body.insertBefore(newDiv, rootDiv.nextSibling);
  } else {
    document.body.appendChild(newDiv);
  }
};

export const pluginRouters = () => {
  const plugins: any[] = (window as any).plugins || [];
  const pluginRoutes: any[] = [];

  for (const plugin of plugins) {
    if (plugin.routes) {
      pluginRoutes.push(
        <System
          key={Math.random()}
          loadScript={true}
          system={plugin.routes}
          pluginName={plugin.name}
        />
      );
    }
  }

  return pluginRoutes;
};

export const pluginsOfPaymentForm = (
  renderPaymentsByType: (type) => JSX.Element
) => {
  const plugins: any[] = (window as any).plugins || [];

  return (
    <PluginsWrapper
      itemName={"payments"}
      plugins={plugins}
      callBack={(_plugin, payments) => {
        const paymentsTypes: JSX.Element[] = [];
        for (const perPayment of payments) {
          if (perPayment.component) {
            paymentsTypes.push(perPayment.component({ ...perPayment }));
          } else {
            paymentsTypes.push(renderPaymentsByType({ ...perPayment }));
          }
        }
        return paymentsTypes;
      }}
    />
  );
};

export const pluginsOfProductCategoryActions = (category: any) => {
  const plugins: any[] = (window as any).plugins || [];

  return (
    <PluginsWrapper
      plugins={plugins}
      itemName={"productCategoryActions"}
      callBack={(_plugin, actions) => {
        return actions.map((action) => {
          const Component = React.lazy(
            loadComponent(action.scope, action.component)
          );

          return <Component key={Math.random()} productCategory={category} />;
        });
      }}
    />
  );
};

export const customNavigationLabel = () => {
  const plugins: any[] = (window as any).plugins || [];
  const customLabels: any[] = [];

  for (const plugin of plugins) {
    for (const lbl of plugin.customNavigationLabel || []) {
      customLabels.push(
        <React.Fragment key={lbl.text}>
          <CustomComponent scope={lbl.scope} component={lbl.component} />
        </React.Fragment>
      );
    }
  }

  return customLabels;
};

export const pluginsOfJobCategoryActions = (productCategoryId: string) => {
  const plugins: any[] = (window as any).plugins || [];

  return (
    <PluginsWrapper
      plugins={plugins}
      itemName={"jobCategoryActions"}
      callBack={(_plugin, actions) => {
        return actions.map((action) => {
          const Component = React.lazy(
            loadComponent(action.scope, action.component)
          );

          return (
            <Component
              key={Math.random()}
              productCategoryId={productCategoryId}
            />
          );
        });
      }}
    />
  );
};

export const pluginsOfWebhooks = () => {
  const plugins = (window as any).plugins.filter((p) => p.webhookActions) || [];

  return plugins;
};
